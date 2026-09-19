import React from "react";
import { Box, Popover, Tooltip } from "@mui/material";
import type { SystemStyleObject, Theme } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import { AdjectiveTypeahead } from "./AdjectiveTypeahead.tsx";
import { DEGREE_LABELS, type CauseSentiment, type Concept, type Definiteness, type Degree, type ModifierRelation, type PathSpecifier } from "@signi/shared";
import {
  BoxComplementType,
  ConceptSelectOpts,
  GenderSlot,
  NounKey,
  NumberSlot,
  PhraseSelection,
  SlotConfig,
  SlotKey,
  slotCategories,
} from "./interfaces.ts";
import { CategoryToggle, SlotBox, type SatelliteIcon, type SlotShape } from "./Boxes.tsx";
import { useConceptLabel } from "../../i18n/useConceptLabel.ts";
import { useBoxCursor } from "../../keyboard/KeyboardProvider.tsx";
import { focusRing } from "../../keyboard/focusRing.ts";
import { boxScopesOf } from "../../keyboard/scope.ts";
import { PICK_INDEX, PICK_TARGET, pickBadgeSx } from "../../keyboard/usePickKeys.ts";
import { useUiString } from "../../i18n/useUiString.ts";
import type { GroupRect } from "./graph.ts";
import type { Disc, Pt } from "./ringLayout.ts";
import { slotHasInlinePicker, slotTypeahead } from "./SlotTypeahead.tsx";

// Props spread onto each draggable node — the absolute positioning + pointer
// handlers wired up by PhraseBuilder.makeDragProps.
export type DragBoxProps = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  sx: SystemStyleObject<Theme>;
};

// Pointer handlers for dragging a whole constituent by its dotted ring. Unlike DragBoxProps this
// omits `sx` — the GroupBox owns its own positioning.
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
  // Verbless noun-phrase mode (an owner's or a conjunct's ring): the `subject` slot is the
  // phrase's head and uses the noun-only picker rather than the subject picker.
  nounPhrase?: boolean;
  // A noun-phrase canvas whose head may still be a pronoun: a conjunct's ("you and I"). Its
  // `subject` slot keeps the pronoun-inclusive picker, which a possessor head does without.
  pronounHead?: boolean;
  // Whether the subject box is drawn at all. False for an instrument period at an action level:
  // the act ("by choosing a word") has no subject of its own — the clause it serves supplies it.
  showSubject?: boolean;
  activeSlot: SlotKey | null;
  renderedSlots: SlotConfig[];
  shownMap: Record<string, boolean>;
  satelliteIconsByParent: Record<string, SatelliteIcon[]>;
  complementToggleIcons: SatelliteIcon[];
  // The direct object's fold-away control, seated where the line to the object leaves the verb
  // phrase's dotted ring, so it reads as that line's start.
  directObjectToggle?: SatelliteIcon;
  // Each constituent's rings and footprint.
  groupRects: GroupRect[];
  // Where each satellite disc sits on its constituent's orbit, and its radius, keyed by node.
  discs: Record<string, Disc>;
  // Where every ring control sits on the canvas, keyed by control (see ringSpecs).
  controlPos: Record<string, Pt>;
  // Which group boxes are collapsed (keyed by GroupRect.label). Read by the
  // GroupBox to pick its collapse/expand icon.
  collapsedGroups: Record<string, boolean>;
  // Compact view: the dotted rings, the satellites and their controls are suppressed, leaving just
  // the tightly-packed words in their solid rings. Read by GroupBox (renders nothing).
  compact: boolean;
  // "__group__" while a dotted ring is being dragged — the GroupBox uses it to switch its cursor.
  draggingKey: string | null;
  makeDragProps: (key: string, onActivate: () => void) => DragBoxProps;
  makeGroupDragProps: (nodeKeys: string[]) => GroupDragProps;
  // Every draggable node's DOM element, keyed by node key — the words and the tense / aspect /
  // determiner toggles alike. Measured each commit, so each ring and disc is sized to its content.
  slotEls: React.MutableRefObject<Map<string, HTMLElement>>;
  handleSlotClick: (slot: SlotKey) => void;
  // Which filled word box is currently open for re-picking its word (null = none).
  editingSlot: SlotKey | null;
  // Click a filled word box to change its word: open its inline picker over the word.
  handleEditSlot: (slot: SlotKey) => void;
  // Leave edit mode for `slot` without changing the word (focus left the box).
  handleCancelEdit: (slot: SlotKey) => void;
  handleConceptSelect: (
    concept: Concept,
    targetSlot?: SlotKey,
    opts?: ConceptSelectOpts,
  ) => void;
  // The effective word-category of a switchable slot (subject/object/cause = noun|pronoun;
  // predicative + adjectives = noun|adjective) and its setter — shared between the on-box
  // toggle and the in-dropdown selector so the two move together.
  slotKind: (slotKey: SlotKey) => string;
  onSlotKindChange: (slotKey: SlotKey, kind: string) => void;
  handleClear: (slot: SlotKey) => void;
  handleToggleNumber: (which: NumberSlot) => void;
  handleToggleGender: (which: GenderSlot) => void;
  handleSetDefiniteness: (which: NounKey, value: Definiteness) => void;
  // Cycle the semantic relation of an attributive-noun modifier sitting in an adjective slot.
  handleCycleModifierRelation: (slotKey: SlotKey) => void;
  // Toggle a noun-modifier's own number (singular ⇄ plural), keyed by its adjective slot.
  handleCycleModifierNumber: (slotKey: SlotKey) => void;
  // Set (or clear, with `undefined`) the adjective modifying a noun-modifier itself.
  handleSetModifierAdjective: (slotKey: SlotKey, concept: Concept | undefined) => void;
  // Cycle the comparative degree of a real adjective sitting in an adjective slot.
  handleCycleDegree: (slotKey: SlotKey) => void;
  handleToggleNegative: () => void;
  handleCycleTense: () => void;
  handleCycleAspect: () => void;
  handleSelectSpecifier: (spec: PathSpecifier) => void;
  handleSelectLocativeSpecifier: (spec: PathSpecifier) => void;
  handleSelectSentiment: (sentiment: CauseSentiment) => void;
  handleToggleCollapse: (label: string) => void;
  handleRemoveComplement: (type: BoxComplementType) => void;
  // The key each satellite's control answers to, by satellite key — read off the keymap by the
  // builder (see keymap.satelliteKey). A control names it in its tooltip whoever is driving, and
  // wears it as a badge while the cursor is on the box it belongs to.
  satelliteKeys: Record<string, string>;
  // Which noun's determiner menu is open, and how to open or close it. Held by the builder rather
  // than by the noun's renderer so the noun's D key can open it from wherever the cursor is.
  determinerMenuFor: NounKey | null;
  onDeterminerMenu: (which: NounKey | null) => void;
  // The verb's *Add a complement* menu, which + opens from the verb box (see ComplementMenu).
  complementMenuOpen: boolean;
  onComplementMenu: (open: boolean) => void;
  // The complement whose relation toolbar is listening for a key, armed by S from its box.
  toolbarFor: SlotKey | null;
  onArmToolbar: (slot: SlotKey | null) => void;
  // Set for a hosted ring's builder: its ring's remove control, which drops the phrase — a conjunct
  // out of its group, an owner off the noun it owns.
  removeRing?: { title: string; onRemove: () => void };
  // ── Cross-container linking (workspace containers only; undefined for a standalone period) ──
  // Report a noun box's DOM element up to the workspace registry (for connectors/greying).
  onBoxRef?: (key: SlotKey, el: HTMLElement | null) => void;
  // Noun keys that are a relative-clause link target — rendered greyed and inert.
  dimmedKeys?: Set<string>;
  // In pick-mode: is this noun an eligible link target? Clicking it completes the link.
  isPickTarget?: (key: SlotKey) => boolean;
  onPickTarget?: (key: SlotKey) => void;
  // Register the instrumental toggle on the verb phrase's dotted ring with the workspace — the
  // start of an instrumental link's connector. Undefined for a standalone period.
  registerVerbAnchor?: (el: HTMLElement | null) => void;
  // ── The phrase console (P02; undefined with no console on the page) ──
  // What the console shows on a box — the line being typed would change it, its token is under the
  // pointer, the console's context rests on it — and the box under the pointer, which the console
  // lights the tokens of.
  consoleMark?: (slot: SlotKey) => { key: string; preview: boolean; lit: boolean; cursor: boolean; number?: number };
  onHoverSlot?: (slot: SlotKey | null) => void;
}

// Register one draggable node's element in the measurement map under `key`. Every node on
// the canvas goes in — a node left out reads as nominally sized, and its ring or disc would
// then be cut too tight around it.
export function nodeElRef(ctx: PhraseRenderContext, key: string) {
  return (el: HTMLElement | null) => {
    if (el) ctx.slotEls.current.set(key, el);
    else ctx.slotEls.current.delete(key);
  };
}

// Shared styling for the little footer chips that hang under a filled slot box (the
// modifier relation / number / adjective controls, and the real-adjective degree chip).
// Each chip is a real <button>: it takes ↵ and Space by itself, and the browser's own focus order
// reaches it, so a control with no letter of its own is still reachable (the plan's principle 6).
const FOOTER_CHIP_SX = {
  display: "inline-block",
  appearance: "none",
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
  lineHeight: 1.4,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "text.secondary",
  "&:hover": { borderColor: "text.secondary" },
  ...focusRing("primary"),
} as const;

// The sign a degree chip shows on a satellite disc's rim, where a word would not fit.
const DEGREE_MARKS: Record<Degree, string> = {
  positive: "±",
  more: "+",
  most: "++",
  less: "−",
  least: "−−",
  equally: "=",
};

// The footer chip that picks the adjective modifying a noun-modifier itself ("semantic
// *phrase* creator"). Empty → a muted add icon; filled → the adjective's label
// (click to reopen the picker, "clear" to remove). The picker is the shared adjective
// typeahead docked in a popover anchored to the chip.
function ModifierAdjectiveChip({
  slotKey,
  adjective,
  onSet,
}: {
  slotKey: SlotKey;
  adjective?: Concept;
  onSet: (slotKey: SlotKey, concept: Concept | undefined) => void;
}) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const word = useConceptLabel();
  const t = useUiString();
  return (
    <>
      <Tooltip
        title={
          adjective
            ? `${t("modifier.adjective")}: ${word(adjective)} — click to change`
            : t("modifier.addAdjective")
        }
      >
        <Box
          component="button"
          type="button"
          // The chip is its own popover's anchor, so the keymap opens it by pressing it rather
          // than by lifting its anchor out (see BoxContext.openModifierAdjective).
          data-kb-control={`modifierAdjective:${slotKey}`}
          onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            setAnchor(e.currentTarget);
          }}
          sx={{
            ...FOOTER_CHIP_SX,
            color: adjective ? "text.secondary" : "text.disabled",
            textTransform: adjective ? "none" : "uppercase",
            fontStyle: adjective ? "italic" : "normal",
          }}
        >
          {adjective ? word(adjective) : <AddIcon sx={{ fontSize: "0.7rem", display: "block" }} />}
        </Box>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Box sx={{ p: 1, minWidth: 180 }}>
          <AdjectiveTypeahead
            onSelect={(c) => {
              onSet(slotKey, c);
              setAnchor(null);
            }}
          />
          {adjective && (
            <Box
              component="button"
              type="button"
              onClick={() => {
                onSet(slotKey, undefined);
                setAnchor(null);
              }}
              sx={{ ...FOOTER_CHIP_SX, mt: 1 }}
            >
              {t("action.clear")}
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}

// A single draggable slot box: pointer-drag wrapper + the cursor's focus ring and scope + the
// SlotBox itself. Shared by both the verb-phrase and noun-phrase builders.
//
// The box is where the keyboard cursor rests: it declares which scopes its keys are looked up in
// (a noun's, a verb's — see boxScopesOf) and takes the cursor while it holds focus, and the one
// window listener in the app does the rest (see KeyboardProvider). It no longer runs a Tab/arrow
// loop of its own: that trapped focus inside one period, and the arrows now move spatially across
// the whole page while ⇥ walks the boxes in reading order.
export function SlotNode({
  slot,
  ctx,
}: {
  slot: SlotConfig;
  ctx: PhraseRenderContext;
}) {
  const {
    makeDragProps,
    slotEls,
    handleSlotClick,
    selection,
    activeSlot,
    handleClear,
    handleConceptSelect,
    slotKind,
    onSlotKindChange,
    handleCycleModifierRelation,
    handleCycleModifierNumber,
    handleSetModifierAdjective,
    handleCycleDegree,
    nounPhrase,
    pronounHead,
    onBoxRef,
    dimmedKeys,
    isPickTarget,
    onPickTarget,
    editingSlot,
    handleEditSlot,
    handleCancelEdit,
  } = ctx;
  const t = useUiString();
  // Which keys this box answers to, and the cursor registration that decides when they apply.
  const cursor = useBoxCursor(slot.key, boxScopesOf(slot.key, selection));
  const mark = ctx.consoleMark?.(slot.key);
  // Whether this canvas's `subject` slot is a noun-only head (see PhraseRenderContext.pronounHead).
  const nounSubject = Boolean(nounPhrase) && !pronounHead;

  // Is this filled box currently open for re-picking its word?
  const editing = editingSlot === slot.key;

  // Link-mode state for this box: a greyed link target (endpoint only) or an eligible
  // pick target (click completes the link). Its click "activates" via the drag machinery.
  const dimmed = dimmedKeys?.has(slot.key) ?? false;
  const pickTarget = isPickTarget?.(slot.key) ?? false;
  // A clean click on a filled word box (one that offers an inline picker) opens it for
  // re-picking — but only once the box is the one in hand: a click that *takes* a filled box
  // does nothing but select it, so a word can be reached, read and commanded without its own
  // picker dropping over it. An empty box has no word to cover, so its picker still opens as
  // soon as the box is selected. (The keyboard says the same thing with ↵ on a filled box.)
  const canRepick =
    Boolean(selection[slot.key]) && slotHasInlinePicker(slot.key, nounSubject);
  // Whether the box already held the slot when the pointer went down. It takes focus on
  // pointer-down and focus selects the slot, so by the time the click completes `activeSlot`
  // names this box whichever click it was — "was it already selected?" can only be read at
  // the press.
  const selectedAtPress = React.useRef(false);
  const onActivate = pickTarget
    ? () => onPickTarget?.(slot.key)
    : dimmed
      ? () => {}
      : () => {
          if (canRepick && selectedAtPress.current) handleEditSlot(slot.key);
          else handleSlotClick(slot.key);
        };

  // An adjective slot filled with a *noun* is an attributive modifier ("sail boat"); it
  // carries a semantic relation (feature / purpose / material) that the Romance engines
  // turn into a preposition. Show a small cycling chip to pick it.
  const held = selection[slot.key];
  const isAdjectiveSlot = slot.key.includes("Adjective");
  const isNounModifier = isAdjectiveSlot && held?.role === "noun";
  // A real adjective ("beautiful") carries a comparative degree (more / most / less /
  // least / equally); a noun modifier ("sail") carries a relation instead. The two are
  // mutually exclusive, so at most one chip shows in the footer. Any slot holding an
  // adjective gets the degree — the adjective slots, and the subject complement when its
  // head is a predicate adjective ("seems happier") rather than a predicate noun.
  const isRealAdjective = held?.role === "adjective";
  const relation: ModifierRelation =
    (selection.modifierRelations?.[slot.key] as ModifierRelation | undefined) ?? "feature";
  const degree: Degree = selection.adjectiveDegrees?.[slot.key] ?? "positive";
  // A noun modifier carries three footer controls: its semantic relation (→ preposition),
  // its own grammatical number, and an optional adjective describing *it* ("di frasi
  // semantiche"). They sit together in one wrapping row under the box.
  const modifierNumber = selection.modifierNumbers?.[slot.key] ?? "singular";
  const modifierAdjective = selection.modifierAdjectives?.[slot.key];
  const modifierFooter = isNounModifier ? (
    <Box
      sx={{
        mt: 0.5,
        display: "flex",
        flexWrap: "wrap",
        gap: 0.5,
        justifyContent: "center",
      }}
    >
      <Tooltip title={`${t("modifier.relation")}: ${t(`modifier.relation.${relation}.gloss`)} — click to change`}>
        <Box
          component="button"
          type="button"
          onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleCycleModifierRelation(slot.key);
          }}
          sx={FOOTER_CHIP_SX}
        >
          {t(`modifier.relation.${relation}`)}
        </Box>
      </Tooltip>
      <Tooltip
        title={`${t("satellite.number")}: ${t(`number.value.${modifierNumber}`)} — click to change`}
      >
        <Box
          component="button"
          type="button"
          onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleCycleModifierNumber(slot.key);
          }}
          sx={FOOTER_CHIP_SX}
        >
          {modifierNumber === "plural" ? "PL" : "SG"}
        </Box>
      </Tooltip>
      <ModifierAdjectiveChip
        slotKey={slot.key}
        adjective={modifierAdjective}
        onSet={handleSetModifierAdjective}
      />
    </Box>
  ) : undefined;
  // A constituent's word sits in its solid ring; a satellite is a disc on the orbit.
  const ring = ctx.groupRects.find((g) => g.mainKey === slot.key);
  const disc = ctx.discs[slot.key];
  const shape: SlotShape | undefined = ring
    ? { r: ring.rIn, kind: "ring" }
    : disc
      ? { r: disc.r, kind: "disc" }
      : undefined;
  const onDisc = shape?.kind === "disc";

  // Same chip styling as the relation chip; shown for a real adjective. A positive
  // (unmarked) degree renders a muted "±" affordance so the control is always reachable.
  // On a disc it is a small round chip on the rim, marked with a sign rather than a word.
  const degreeChip = isRealAdjective ? (
    <Tooltip title={`${t("modifier.degree")}: ${DEGREE_LABELS[degree]} — click to change`}>
      <Box
        component="button"
        type="button"
        data-testid={`degree-${slot.key}`}
        onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          handleCycleDegree(slot.key);
        }}
        sx={{
          ...FOOTER_CHIP_SX,
          ...(onDisc
            ? {
                display: "grid",
                placeItems: "center",
                minWidth: 18,
                height: 18,
                px: 0.25,
                py: 0,
                borderRadius: "9px",
                fontSize: "0.6rem",
                letterSpacing: 0,
              }
            : { mt: 0.5 }),
          color: degree === "positive" ? "text.disabled" : "text.secondary",
        }}
      >
        {onDisc ? DEGREE_MARKS[degree] : degree === "positive" ? "±" : degree}
      </Box>
    </Tooltip>
  ) : undefined;
  // A switchable slot (subject/object/cause = noun|pronoun; predicative + adjectives = noun|adj)
  // wears its category toggle on the empty box; the same value threads into the picker so
  // the in-dropdown selector matches. Single-vocabulary slots return null → no toggle.
  const categories = slotCategories(slot.key, nounSubject);
  const categoryToggle =
    categories && !held ? (
      <CategoryToggle
        options={categories.options}
        value={slotKind(slot.key)}
        onChange={(v) => onSlotKindChange(slot.key, v)}
      />
    ) : undefined;

  const { sx: dragSx, onPointerDown: startDrag, ...dragHandlers } = makeDragProps(
    slot.key,
    onActivate,
  );

  return (
    <Box
      {...dragHandlers}
      {...cursor}
      // An eligible target of the pick in flight: numbered where it sits, so a digit takes it.
      // A real click reaches the same handler through the drag machinery's own activation, so the
      // second call is a no-op — the pick it would complete is already resolved.
      {...(pickTarget ? { [PICK_TARGET]: slot.key, onClick: () => onPickTarget?.(slot.key) } : {})}
      // A numbered target of the console's link list wears its number here too.
      {...(mark?.number !== undefined ? { [PICK_INDEX]: mark.number } : {})}
      onPointerDown={(e: React.PointerEvent) => {
        selectedAtPress.current = activeSlot === slot.key;
        startDrag(e);
      }}
      sx={[dragSx, focusRing(slot.color), pickTarget || mark?.number !== undefined ? pickBadgeSx : {}]}
      // The console lights this box's tokens while the pointer is over it, and finds the box by its
      // mark to give it the keyboard back.
      data-console-mark={mark?.key}
      onMouseEnter={() => ctx.onHoverSlot?.(slot.key)}
      onMouseLeave={() => ctx.onHoverSlot?.(null)}
      ref={(el: HTMLElement | null) => {
        if (el) slotEls.current.set(slot.key, el);
        else slotEls.current.delete(slot.key);
        onBoxRef?.(slot.key, el);
      }}
      onFocus={(e: React.FocusEvent<HTMLElement>) => {
        cursor.onFocus(e);
        handleSlotClick(slot.key);
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        cursor.onBlur(e);
        // Focus left the box (clicked elsewhere) while re-picking — restore the word.
        // Popper items keep focus (mousedown preventDefault), so choosing one won't blur.
        if (editing && !e.currentTarget.contains(e.relatedTarget as Node | null))
          handleCancelEdit(slot.key);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        // esc inside the open word picker steps back out onto the box, so the cursor is on the
        // canvas again and the arrows and letters apply. (The picker's own esc closes its list
        // first; phase 2's shared picker keys make that the two distinct steps of §4.5.)
        if (e.key !== "Escape" || e.target === e.currentTarget) return;
        e.stopPropagation();
        e.currentTarget.focus();
        if (editing) handleCancelEdit(slot.key);
      }}
    >
      <SlotBox
        slot={slot}
        concept={selection[slot.key]}
        isActive={activeSlot === slot.key}
        dimmed={dimmed}
        highlight={pickTarget}
        editing={editing}
        shape={shape}
        onClear={() => handleClear(slot.key)}
        categoryToggle={categoryToggle}
        emptyContent={slotTypeahead({
          slotKey: slot.key,
          activeSlot,
          selection,
          onSelect: handleConceptSelect,
          nounSubject,
          editing,
          kind: categories ? slotKind(slot.key) : undefined,
          onKindChange: categories
            ? (v) => onSlotKindChange(slot.key, v)
            : undefined,
        })}
        footer={modifierFooter ?? (onDisc ? undefined : degreeChip)}
        rim={onDisc ? degreeChip : undefined}
        preview={mark?.preview}
        lit={mark?.lit}
        consoleCursor={mark?.cursor}
      />
    </Box>
  );
}
