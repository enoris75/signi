import React from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import type { Concept, PathSpecifier } from "@signi/shared";
import {
  GenderSlot,
  NumberSlot,
  PhraseSelection,
  SlotConfig,
  SlotKey,
} from "./interfaces.ts";
import { SlotBox, type SatelliteIcon } from "./Boxes.tsx";
import type { GroupRect } from "./graph.ts";
import { slotTypeahead } from "./SlotTypeahead.tsx";

// Props spread onto each draggable node — the absolute positioning + pointer
// handlers wired up by PhraseBuilder.makeDragProps.
export type DragBoxProps = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  sx: SxProps<Theme>;
};

// Everything the VerbPhrase / NounPhrase builders need from the parent. They all
// paint onto the same absolutely-positioned canvas and share its drag machinery,
// keyboard-nav list, and selection handlers, so we thread one bag through.
export interface PhraseRenderContext {
  selection: PhraseSelection;
  activeSlot: SlotKey | null;
  renderedSlots: SlotConfig[];
  shownMap: Record<string, boolean>;
  satelliteIconsByParent: Record<string, SatelliteIcon[]>;
  complementToggleIcons: SatelliteIcon[];
  groupRects: GroupRect[];
  makeDragProps: (key: string, onActivate: () => void) => DragBoxProps;
  slotEls: React.MutableRefObject<Map<SlotKey, HTMLElement>>;
  handleSlotClick: (slot: SlotKey) => void;
  handleConceptSelect: (concept: Concept, targetSlot?: SlotKey) => void;
  handleClear: (slot: SlotKey) => void;
  handleToggleNumber: (which: NumberSlot) => void;
  handleToggleGender: (which: GenderSlot) => void;
  handleToggleNegative: () => void;
  handleSelectSpecifier: (spec: PathSpecifier) => void;
}

// A single draggable slot box: pointer-drag wrapper + Tab/arrow keyboard nav
// (cycling the global renderedSlots list) + the SlotBox itself. Shared by both
// the verb-phrase and noun-phrase builders.
export function SlotNode({
  slot,
  ctx,
}: {
  slot: SlotConfig;
  ctx: PhraseRenderContext;
}) {
  const {
    renderedSlots,
    makeDragProps,
    slotEls,
    handleSlotClick,
    selection,
    activeSlot,
    handleClear,
    satelliteIconsByParent,
    handleConceptSelect,
  } = ctx;
  const idx = renderedSlots.findIndex((s) => s.key === slot.key);
  return (
    <Box
      {...makeDragProps(slot.key, () => handleSlotClick(slot.key))}
      ref={(el: HTMLElement | null) => {
        if (el) slotEls.current.set(slot.key, el);
        else slotEls.current.delete(slot.key);
      }}
      tabIndex={0}
      onFocus={() => handleSlotClick(slot.key)}
      onKeyDown={(e: React.KeyboardEvent) => {
        const isDirectFocus = e.target === e.currentTarget;
        let dir: 1 | -1 | null = null;
        if (e.key === "Tab") {
          dir = e.shiftKey ? -1 : 1;
        } else if (isDirectFocus && e.key === "ArrowRight") {
          dir = 1;
        } else if (isDirectFocus && e.key === "ArrowLeft") {
          dir = -1;
        }
        if (dir === null) return;
        e.preventDefault();
        const nextIdx =
          (idx + dir + renderedSlots.length) % renderedSlots.length;
        const nextKey = renderedSlots[nextIdx].key;
        handleSlotClick(nextKey);
        slotEls.current.get(nextKey)?.focus();
      }}
    >
      <SlotBox
        slot={slot}
        concept={selection[slot.key]}
        isActive={activeSlot === slot.key}
        onClear={() => handleClear(slot.key)}
        satellites={satelliteIconsByParent[slot.key]}
        emptyContent={slotTypeahead({
          slotKey: slot.key,
          activeSlot,
          selection,
          onSelect: handleConceptSelect,
        })}
      />
    </Box>
  );
}
