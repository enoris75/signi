import { useEffect, useState } from "react";
import { Box, Typography, Divider, IconButton, Tooltip, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HubIcon from "@mui/icons-material/Hub";
import { type Concept } from "@signi/shared";
import ConceptPalette from "../ConceptPalette.tsx";
import { WordMap } from "../WordMap/WordMap.tsx";
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
  const headerOffset = useHeaderOffset();

  return (
    <Paper
      elevation={8}
      square
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
          const onMove = (ev: PointerEvent) => {
            currentW = Math.max(
              80,
              Math.min(400, startW - (ev.clientX - startX)),
            );
            onWidthChange(currentW);
          };
          const onUp = () => {
            localStorage.setItem(
              "signi:phraseBuilderSidebarWidth",
              String(Math.round(currentW)),
            );
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
          };
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
          window.addEventListener("pointercancel", onUp);
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
          {activeSlotConfig ? activeSlotConfig.label : "Words"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Tooltip title="Show word map" placement="left">
            <IconButton
              size="small"
              onClick={() => setMapOpen(true)}
              aria-label="Show word map"
              sx={{ p: 0.25 }}
            >
              <HubIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hide words" placement="left">
            <IconButton
              size="small"
              onClick={onClose}
              aria-label="Hide words"
              sx={{ p: 0.25 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1 }}>
        {activeSlotConfig ? (
          activeSlotConfig.roles.map((role) => (
            <ConceptPalette
              key={role}
              role={role}
              onSelect={(c) => onConceptSelect(c, activeSlot as SlotKey)}
              selectedId={selection[activeSlot as SlotKey]?.id}
            />
          ))
        ) : (
          <>
            <Typography
              color="text.secondary"
              sx={{ fontSize: "0.72rem", fontStyle: "italic", mb: 1 }}
            >
              Click a slot to filter.
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
