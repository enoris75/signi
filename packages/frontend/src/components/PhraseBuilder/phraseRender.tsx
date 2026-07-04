import React from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import type { Concept, ComplementType, PathSpecifier } from "@signi/shared";
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

// Pointer handlers for dragging a whole role group (its dashed box moves every
// child node at once). Unlike DragBoxProps this omits `sx` — the dashed GroupBox
// owns its own positioning.
export type GroupDragProps = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
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
  // Which group boxes are collapsed (keyed by GroupRect.label). Read by the
  // GroupBox to pick its collapse/expand icon.
  collapsedGroups: Record<string, boolean>;
  // "__group__" while a dashed box is being dragged — the GroupBox uses it to
  // switch its cursor.
  draggingKey: string | null;
  makeDragProps: (key: string, onActivate: () => void) => DragBoxProps;
  makeGroupDragProps: (nodeKeys: string[]) => GroupDragProps;
  slotEls: React.MutableRefObject<Map<SlotKey, HTMLElement>>;
  handleSlotClick: (slot: SlotKey) => void;
  handleConceptSelect: (concept: Concept, targetSlot?: SlotKey) => void;
  handleClear: (slot: SlotKey) => void;
  handleToggleNumber: (which: NumberSlot) => void;
  handleToggleGender: (which: GenderSlot) => void;
  handleToggleNegative: () => void;
  handleSelectSpecifier: (spec: PathSpecifier) => void;
  handleToggleCollapse: (label: string) => void;
  handleRemoveComplement: (type: ComplementType) => void;
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
