import { Box, Typography, Divider } from "@mui/material";
import { type Concept } from "@signi/shared";
import ConceptPalette from "../ConceptPalette.tsx";
import {
  PhraseSelection,
  SlotConfig,
  SlotKey,
} from "./interfaces.ts";

interface PhraseSidebarProps {
  width: number;
  onWidthChange: (width: number) => void;
  maxHeight: number;
  selection: PhraseSelection;
  activeSlot: SlotKey | null;
  activeSlotConfig: SlotConfig | null;
  visibleSlots: SlotConfig[];
  onSlotClick: (slot: SlotKey) => void;
  onConceptSelect: (concept: Concept, targetSlot?: SlotKey) => void;
}

export function PhraseSidebar({
  width,
  onWidthChange,
  maxHeight,
  selection,
  activeSlot,
  activeSlotConfig,
  visibleSlots,
  onSlotClick,
  onConceptSelect,
}: PhraseSidebarProps) {
  return (
    <>
      {/* Sidebar resize handle */}
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
          width: 6,
          flexShrink: 0,
          cursor: "ew-resize",
          touchAction: "none",
          borderLeft: "2px solid",
          borderColor: "divider",
          bgcolor: "divider",
          opacity: 0.6,
          transition: "opacity 0.15s, background-color 0.15s",
          "&:hover": {
            opacity: 1,
            bgcolor: "primary.main",
            borderColor: "primary.main",
          },
        }}
      />
      <Box
        sx={{
          width,
          flexShrink: 0,
          borderLeft: "1px solid",
          borderColor: "divider",
          pl: 1.5,
          maxHeight,
          overflowY: "auto",
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
            mb: 1,
            display: "block",
          }}
        >
          {activeSlotConfig ? activeSlotConfig.label : "Words"}
        </Typography>
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
    </>
  );
}
