import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Box, Typography, Divider, IconButton, Tooltip, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HubIcon from "@mui/icons-material/Hub";
import { type Concept } from "@signi/shared";
import ConceptPalette from "../ConceptPalette.tsx";
import { WordMap } from "../WordMap/WordMap.tsx";
import { useUiString } from "../../i18n/useUiString.ts";
import { useWindowDrag } from "../../hooks/useWindowDrag.ts";
import { boxOf } from "../../keyboard/boxes.ts";
import { SIDEBAR_WIDTH_KEY } from "./storageKeys.ts";
import {
  PhraseSelection,
  SlotConfig,
  SlotKey,
} from "./interfaces.ts";

/**
 * The height of the page's sticky header, which is painted above this panel: the panel starts
 * below it, or its own title row (and the controls in it) would be covered by the header and
 * unclickable. Measured rather than assumed — the header's height depends on the font the UI
 * language renders its tagline in. Falls back to 0 if the header isn't there.
 */
function useHeaderOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const header = document.querySelector("[data-signi-header]");
    if (!header) return;
    // The border box, not the entry's contentRect: the header's padding and bottom border are
    // part of what covers the panel.
    const observer = new ResizeObserver(() => {
      setOffset(header.getBoundingClientRect().height);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return offset;
}

interface PhraseSidebarProps {
  // Whether the overlay is shown. Owned by the page (App) so a control in the
  // header can toggle it; this panel only reports when it wants to close.
  open: boolean;
  onClose: () => void;
  width: number;
  onWidthChange: (width: number) => void;
  selection: PhraseSelection;
  activeSlot: SlotKey | null;
  activeSlotConfig: SlotConfig | null;
  visibleSlots: SlotConfig[];
  onSlotClick: (slot: SlotKey) => void;
  onConceptSelect: (concept: Concept, targetSlot?: SlotKey) => void;
}

export function PhraseSidebar({
  open,
  onClose,
  width,
  onWidthChange,
  selection,
  activeSlot,
  activeSlotConfig,
  visibleSlots,
  onSlotClick,
  onConceptSelect,
}: PhraseSidebarProps) {
  // The map opens over the whole page, not inside this panel — the panel is a few hundred pixels
  // wide and a graph needs the room. Its open state is local: nothing outside cares.
  const [mapOpen, setMapOpen] = useState(false);
  // The word lists are drawn only while the panel is out, and while it slides back in. Hidden, they
  // were a button and a tooltip per word of the corpus, drawn again on every keystroke in the
  // console, per period.
  const [filled, setFilled] = useState(open);
  if (open && !filled) setFilled(true);
  const headerOffset = useHeaderOffset();
  const t = useUiString();
  const startDrag = useWindowDrag();
  const listRef = useRef<HTMLDivElement | null>(null);
  // What the cursor was on when the panel took it, so esc can put it back there.
  const cameFrom = useRef<HTMLElement | null>(null);

  const words = () =>
    Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-kb-word]") ?? []);

  /** Back to the canvas, at the box the panel was opened from. */
  function leave() {
    const back = cameFrom.current;
    (back?.isConnected ? back : document.querySelector<HTMLElement>("[data-kb-box]"))?.focus();
  }

  /**
   * The panel's own keys (the plan's §4.6): ↑ ↓ walk the words, typing jumps to the first one
   * that starts with what was typed, M opens the word map, and esc goes back to the canvas.
   * Choosing a word is the button's own ↵, which also returns the cursor (see onSelect below).
   */
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      leave();
      return;
    }
    if (event.key.toLowerCase() === "m" && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      setMapOpen(true);
      return;
    }
    const all = words();
    const delta = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (delta) {
      const at = all.findIndex((w) => w === document.activeElement);
      const next = all[Math.min(Math.max(at + delta, 0), all.length - 1)];
      if (next) {
        event.preventDefault();
        next.focus();
      }
      return;
    }
    // Type to jump: a letter goes to the first word that starts with it, the way a long list of
    // names is navigated anywhere else.
    if (event.key.length !== 1 || event.metaKey || event.ctrlKey) return;
    const letter = event.key.toLowerCase();
    const hit = all.find((w) => (w.textContent ?? "").trim().toLowerCase().startsWith(letter));
    if (!hit) return;
    event.preventDefault();
    hit.focus();
  }

  return (
    <Paper
      elevation={8}
      square
      data-kb-region="words"
      // Off-screen while hidden, and inert with it: `pointerEvents: none` kept the mouse out but
      // left every word in the page's tab order, so ⇥ wandered into a panel nobody could see.
      // Spread as an attribute: React 18 does not type `inert`, and the browser reads the
      // attribute rather than the property.
      {...(open ? {} : ({ inert: "" } as Record<string, unknown>))}
      onKeyDown={onKeyDown}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && !open) setFilled(false);
      }}
      onFocusCapture={(event) => {
        // Remember where the cursor came from, so esc can put it back on that box.
        const from = boxOf(event.relatedTarget as Element | null);
        if (from) cameFrom.current = from;
      }}
      sx={{
        position: "fixed",
        top: headerOffset,
        right: 0,
        bottom: 0,
        width,
        zIndex: (t) => t.zIndex.drawer,
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid",
        borderColor: "divider",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.2s ease",
        // Off-screen while hidden — keep it out of the pointer path so it never
        // intercepts clicks meant for the canvas beneath it.
        pointerEvents: open ? "auto" : "none",
      }}
    >
      {/* Resize handle on the panel's left edge. Dragging left widens it. */}
      <Box
        onPointerDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startW = width;
          let currentW = startW;
          startDrag(
            (ev) => {
              currentW = Math.max(
                80,
                Math.min(400, startW - (ev.clientX - startX)),
              );
              onWidthChange(currentW);
            },
            () =>
              localStorage.setItem(
                SIDEBAR_WIDTH_KEY,
                String(Math.round(currentW)),
              ),
          );
        }}
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: "ew-resize",
          touchAction: "none",
          bgcolor: "divider",
          opacity: 0.6,
          transition: "opacity 0.15s, background-color 0.15s",
          "&:hover": { opacity: 1, bgcolor: "primary.main" },
        }}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          {activeSlotConfig
            ? activeSlotConfig.labelKey
              ? t(activeSlotConfig.labelKey)
              : activeSlotConfig.label
            : t("words.heading")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Tooltip title={t("action.showWordMap")} placement="left">
            <IconButton
              size="small"
              onClick={() => setMapOpen(true)}
              aria-label={t("action.showWordMap")}
              sx={{ p: 0.25 }}
            >
              <HubIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("action.hideWords")} placement="left">
            <IconButton
              size="small"
              onClick={onClose}
              aria-label={t("action.hideWords")}
              sx={{ p: 0.25 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box ref={listRef} sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1 }}>
        {!filled ? null : activeSlotConfig ? (
          activeSlotConfig.roles.map((role) => (
            <ConceptPalette
              key={role}
              role={role}
              onSelect={(c) => {
                onConceptSelect(c, activeSlot as SlotKey);
                leave();
              }}
              selectedId={selection[activeSlot as SlotKey]?.id}
            />
          ))
        ) : (
          <>
            <Typography
              color="text.secondary"
              sx={{ fontSize: "0.72rem", fontStyle: "italic", mb: 1 }}
            >
              {t("hint.clickSlotToFilter")}
            </Typography>
            <Divider sx={{ my: 1 }} />
            {visibleSlots.map((slot) =>
              slot.roles.map((role) => (
                <ConceptPalette
                  key={`${slot.key}-${role}`}
                  role={role}
                  onSelect={(c) => {
                    onSlotClick(slot.key);
                    onConceptSelect(c, slot.key);
                    leave();
                  }}
                  selectedId={selection[slot.key]?.id}
                />
              )),
            )}
          </>
        )}
      </Box>

      <WordMap open={mapOpen} onClose={() => setMapOpen(false)} />
    </Paper>
  );
}
