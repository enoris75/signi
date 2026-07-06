import React from "react";
import { Box, Tooltip, type SxProps, type Theme } from "@mui/material";
import { MODIFIER_RELATION_LABELS, type Concept, type ComplementType, type ModifierRelation, type PathSpecifier } from "@signi/shared";
import {
  GenderSlot,
  NounKey,
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
  // Verbless noun-phrase mode (the possessor editor): the `subject` slot is the
  // possessor head and must use the noun-only picker rather than the subject picker.
  nounPhrase?: boolean;
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
  handleCycleDefiniteness: (which: NounKey) => void;
  // Cycle the semantic relation of an attributive-noun modifier sitting in an adjective slot.
  handleCycleModifierRelation: (slotKey: SlotKey) => void;
  handleToggleNegative: () => void;
  handleCycleTense: () => void;
  handleSelectSpecifier: (spec: PathSpecifier) => void;
  handleToggleCollapse: (label: string) => void;
  // Compact a dotted box's child nodes into a tidy centered cluster.
  handleRearrangeGroup: (nodeKeys: string[]) => void;
  handleRemoveComplement: (type: ComplementType) => void;
  // ── Cross-container linking (top-level containers only; undefined for possessors) ──
  // Report a noun box's DOM element up to the workspace registry (for connectors/greying).
  onBoxRef?: (key: SlotKey, el: HTMLElement | null) => void;
  // Noun keys that are a relative-clause link target — rendered greyed and inert.
  dimmedKeys?: Set<string>;
  // In pick-mode: is this noun an eligible link target? Clicking it completes the link.
  isPickTarget?: (key: SlotKey) => boolean;
  onPickTarget?: (key: SlotKey) => void;
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
    handleConceptSelect,
    handleCycleModifierRelation,
    nounPhrase,
    onBoxRef,
    dimmedKeys,
    isPickTarget,
    onPickTarget,
  } = ctx;
  const idx = renderedSlots.findIndex((s) => s.key === slot.key);

  // Link-mode state for this box: a greyed link target (endpoint only) or an eligible
  // pick target (click completes the link). Its click "activates" via the drag machinery.
  const dimmed = dimmedKeys?.has(slot.key) ?? false;
  const pickTarget = isPickTarget?.(slot.key) ?? false;
  const onActivate = pickTarget
    ? () => onPickTarget?.(slot.key)
    : dimmed
      ? () => {}
      : () => handleSlotClick(slot.key);

  // An adjective slot filled with a *noun* is an attributive modifier ("sail boat"); it
  // carries a semantic relation (feature / purpose / material) that the Romance engines
  // turn into a preposition. Show a small cycling chip to pick it.
  const held = selection[slot.key];
  const isNounModifier = slot.key.includes("Adjective") && held?.role === "noun";
  const relation: ModifierRelation =
    (selection.modifierRelations?.[slot.key] as ModifierRelation | undefined) ?? "feature";
  const relationChip = isNounModifier ? (
    <Tooltip title={`Relation: ${MODIFIER_RELATION_LABELS[relation]} — click to change`}>
      <Box
        component="span"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          handleCycleModifierRelation(slot.key);
        }}
        sx={{
          display: "inline-block",
          mt: 0.5,
          px: 0.75,
          py: 0.1,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          cursor: "pointer",
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.55rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "text.secondary",
          "&:hover": { borderColor: "text.secondary" },
        }}
      >
        {relation}
      </Box>
    </Tooltip>
  ) : undefined;
  return (
    <Box
      {...makeDragProps(slot.key, onActivate)}
      ref={(el: HTMLElement | null) => {
        if (el) slotEls.current.set(slot.key, el);
        else slotEls.current.delete(slot.key);
        onBoxRef?.(slot.key, el);
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
        dimmed={dimmed}
        highlight={pickTarget}
        onClear={() => handleClear(slot.key)}
        emptyContent={slotTypeahead({
          slotKey: slot.key,
          activeSlot,
          selection,
          onSelect: handleConceptSelect,
          nounSubject: nounPhrase,
        })}
        footer={relationChip}
      />
    </Box>
  );
}
