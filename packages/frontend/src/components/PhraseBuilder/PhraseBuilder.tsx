import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  CAUSE_SENTIMENTS,
  PATH_SPECIFIERS,
  type Concept,
  type CauseSentiment,
  type Definiteness,
  type ImperativeRegister,
  type PathSpecifier,
} from "@signi/shared";
import {
  BoxComplementType,
  adaptPossessorBinding,
  ConceptSelectOpts,
  GenderSlot,
  ImperativePerson,
  NounAddress,
  NounKey,
  NumberSlot,
  PhraseSelection,
  builderNounAddress,
  conjunctAddress,
  possessorAddress,
  POSSESSOR_KEY,
  POSSESSOR_REF_KEY,
  slotCategories,
  SlotConfig,
  SlotKey,
  WorkspaceBinding,
} from "./interfaces.ts";
import {
  ALL_SLOTS,
  NOUN_KEYS,
  REVEALABLE_SLOT_KEYS,
  getActiveSlots,
  DEFAULT_POSITIONS,
  GRAPH_HEIGHT,
  MIN_GRAPH_HEIGHT,
  MUI_COLOR_HEX,
} from "./slots.ts";
import {
  applyConceptSelect,
  applyClear,
  addConjunct,
  conjunctsOf,
  cycleAspect,
  cycleDegree,
  cycleModifierRelation,
  cycleModifierNumber,
  cycleNounConjunction,
  setModifierAdjective,
  cycleTense,
  removeConjunct,
  removePossessor,
  clearPossessorRef,
  setPossessorRef,
  updateNounAt,
  setDefiniteness,
  setImperativePerson,
  setImperativeRegister,
  setSentiment,
  setSpecifier,
  toggleGender,
  toggleImperative,
  toggleInfinitive,
  toggleNegative,
  toggleNumber,
} from "./phraseReducers.ts";
import {
  buildSatelliteIcons,
  buildSatellites,
  type Satellite,
} from "./satellites.tsx";
import {
  COMPACT_PAD_H,
  COMPACT_PAD_V,
  computeCompactLayout,
  packPeriod,
} from "./layout.ts";
import { buildEdges, buildRings, roleGroups, type Edge } from "./graph.ts";
import { buildRingSpecs, perimeterControlKey, portKey } from "./ringSpecs.ts";
import { BUTTON_HALF, innerRadius, type Pt } from "./ringLayout.ts";
import { type PhraseRenderContext } from "./phraseRender.tsx";
import { PhraseCanvas } from "./PhraseCanvas.tsx";
import { PhraseSidebar } from "./PhraseSidebar.tsx";
import { Resizer } from "./Resizer.tsx";
import {
  CorefPickContext,
  possessiveHintEn,
  useCorefPick,
  useProvideCorefPick,
} from "./CorefPickContext.tsx";
import { ConjunctRings } from "./ConjunctRings.tsx";
import { OwnerRings } from "./OwnerRings.tsx";
import type { RingHost } from "./ringHost.ts";
import {
  chainKeys,
  chainPortKey,
  conjunctKey,
  conjunctLinks,
  dropConjunctPosition,
  hostedRect,
  openConjunctsFor,
} from "./conjunctChain.ts";
import {
  ownerLink,
  ownersUnder,
  pointerBend,
  pointerLink,
  possessionsFor,
  type OwnerSpot,
} from "./ownerChain.ts";
import { PeriodContainer, periodControls } from "./PeriodContainer.tsx";
import { useDrag } from "./hooks/useDrag.ts";
import { useHeightRebase } from "./hooks/useHeightRebase.ts";
import { useElementSize } from "./hooks/useElementSize.ts";
import { useCornerOverlap } from "./hooks/useCornerOverlap.ts";
import { useBoxSizes } from "./hooks/useBoxSizes.ts";
import { useGeometryNotify } from "./hooks/useGeometryNotify.ts";
import { useOverlapResolution } from "./hooks/useOverlapResolution.ts";
import { useHostedRings } from "./hooks/useHostedRings.ts";
import { useReportOwnRing } from "./hooks/useReportOwnRing.ts";
import { useHostedRingPlacement } from "./hooks/useHostedRingPlacement.ts";
import { useStoredNumber } from "./hooks/useStoredNumber.ts";
import { nextActiveSlot } from "./functions/nextActiveSlot.ts";
import { applyCollapse } from "./functions/applyCollapse.ts";
import { decoratePerimeterControls } from "./functions/decoratePerimeterControls.ts";
import { ringLookup, wordPlacement } from "./functions/canvasGeometry.ts";
import { useUiLanguage } from "../../i18n/LanguageContext.tsx";
import { useUiString } from "../../i18n/useUiString.ts";

export interface PhraseBuilderProps {
  selection: PhraseSelection;
  onPhraseUpdate: (updater: (prev: PhraseSelection) => PhraseSelection) => void;
  onRemove?: () => void;
  // Top-level only: this is the sole period in the workspace, so it can't be deleted — the
  // header's `onRemove` control clears its content in place instead of removing the container.
  soleContainer?: boolean;
  // Top-level only: move this period one place up/down the workspace stack. Left undefined
  // at the ends of the stack, where the header shows the control disabled.
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  // Top-level only: save just this clause (a "period") to the saved-phrase store. Shown as
  // a small icon in the main-clause header.
  onSave?: () => void;
  // Top-level only: the word-palette overlay's open state, lifted to the page
  // header so a control there can toggle it. The panel reports its own close.
  wordsPanelOpen?: boolean;
  onWordsPanelClose?: () => void;
  // Workspace container id + the cross-container linking hooks. Present for every
  // top-level container in the workspace; forwarded (unchanged) into the builders of the rings it
  // hosts (conjuncts, owners) so their head can source a cross-container relative-clause link too.
  containerId?: string;
  binding?: WorkspaceBinding;
  // The workspace address of *this* builder's head noun, set only when this builder edits a hosted
  // ring's phrase — a conjunct's or an owner's (its head lives in the `subject` slot). It names that
  // head within the container — e.g. `directObject/possessor` — so the head can anchor a link.
  // Undefined for a top-level container (its nouns are their own plain addresses). See
  // `linkBinding` / `possessorAddress`.
  possessorPath?: NounAddress;
  /**
   * This builder edits a bare noun phrase, so it shows no predicate — the subject box and its
   * satellites, nothing else. Set for a *conjunct*: a conjunct is one phrase of a coordinated noun
   * element ("Peter and **Paul**"), and a phrase has no verb of its own.
   *
   * Set for an *owner* too. An owner may carry a clause — "the fox of the boy who cried wolf" — but
   * that clause is a relative link from its head to another container, like any noun's. The plan
   * builds an owner from its head alone, so a verb of its own would be dropped.
   */
  nounPhraseOnly?: boolean;
  /**
   * Set for a hosted ring's builder — a conjunct's or an owner's: its ring is drawn on the period's
   * canvas, not on a canvas of its own. It borrows that canvas's place, size, view and drag
   * machinery, and reports the ring it drew back (see ConjunctRings, OwnerRings).
   */
  ringHost?: RingHost;
}

export function PhraseBuilder({
  selection,
  onPhraseUpdate,
  onRemove,
  soleContainer = false,
  onMoveUp,
  onMoveDown,
  onSave,
  wordsPanelOpen = false,
  onWordsPanelClose,
  binding,
  possessorPath,
  nounPhraseOnly = false,
  ringHost,
}: PhraseBuilderProps) {
  const { uiLanguage } = useUiLanguage();
  const t = useUiString();
  // When this builder edits a possessor (a `possessorPath` naming its head), wrap the
  // container's `binding` so the sub-builder can link like any container: its internal head
  // key `"subject"` is mapped onto the possessor address, and it is never itself a link
  // *target* (a possessor head can only *source* a relative clause today). Top-level
  // containers use their `binding` unchanged.
  const linkBinding: WorkspaceBinding | undefined =
    binding && possessorPath
      ? adaptPossessorBinding(binding, possessorPath)
      : binding;
  // A conjunct's or an owner's builder: a noun phrase inside a period, not a period of its own. It
  // takes no part in the period's moods, connectors or instrument, though `binding` is the
  // container's own.
  const nested = Boolean(possessorPath);
  // Coref-pick coordinator for pronominal possessors ("the boy and his horse"). The outermost
  // period builder owns one (keyed to the whole period selection) and re-provides it below; a
  // nested conjunct / possessor builder inherits the parent's, so a pick spans the whole tree.
  const parentCoref = useCorefPick();
  const ownCoref = useProvideCorefPick(selection);
  const coref = parentCoref ?? ownCoref;
  // Map a local noun key to its period-root address (what a coref reference stores / points at,
  // and what a link is keyed by): a top-level builder's keys are themselves, a nested builder's
  // head "subject" is its `possessorPath`, and its other nouns sit under that (see
  // builderNounAddress). The same mapping `adaptPossessorBinding` applies.
  const nounAddress = (key: NounKey): NounAddress => builderNounAddress(possessorPath, key);
  // This period is the instrument of another clause, and its reification degree decides what it
  // holds — so the canvas shows exactly the boxes the sentence will read (see AbstractionLevel):
  //  · object            → a bare noun phrase ("with a word"): the subject box alone, no predicate.
  //  · process / concept → an act ("by choosing a word"): a verb and its direct object, and *no*
  //                        subject — the clause above is the one doing it.
  const isInstrument = !nested && Boolean(binding?.instrumental.hasTarget);
  const instrumentLevel = binding?.instrumental.level ?? "object";
  // A conjunct's or an owner's ring is the other bare noun phrase (see `nounPhraseOnly`).
  const nounPhraseMode = nounPhraseOnly || (isInstrument && instrumentLevel === "object");
  const actionMode = isInstrument && instrumentLevel !== "object";
  // A period starts on its subject noun phrase — translation begins as soon as a subject
  // is chosen, so a verbless period (a bare noun phrase like "breaking news") is possible.
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>("subject");
  // A filled word box the user clicked to change its word: its inline picker is shown
  // over the current word. Null when no box is being re-picked. Cleared on select or blur.
  const [editingSlot, setEditingSlot] = useState<SlotKey | null>(null);
  // The chosen word-category (noun|pronoun / noun|adjective) for each switchable empty box,
  // keyed by slot. Set by the on-box toggle or the in-dropdown selector — the two read the
  // same value here, so they stay in sync. A slot with no stored entry falls back to the
  // held word's class (a re-pick) or the slot's default (see kindFor).
  const [slotKindState, setSlotKindState] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  // Which dotted role-group boxes are collapsed (keyed by group label). A
  // collapsed box shows only its main word; its satellites stay set but hidden.
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  // Compact view: collapse every dotted ring down to just its core word at once — a
  // period-level toggle over the per-group collapse below. It doesn't touch
  // `collapsedGroups`, so any manual per-box collapses are preserved when it turns off.
  const [compactView, setCompact] = useState(false);
  // A hosted ring is one more constituent of the period's canvas, so it follows that canvas's view.
  const compact = ringHost?.compact ?? compactView;
  const [sidebarWidth, setSidebarWidth] = useStoredNumber("signi:phraseBuilderSidebarWidth", 160);
  // Where a standalone period card has been dragged to by its border, in viewport pixels;
  // null while it sits in the page flow. The drag itself lives in PeriodContainer, but the
  // state is held here because this component's outer Box is what goes `fixed`.
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  // The rings hosted on this canvas — conjuncts' and owners' — as each one's builder reports drawing
  // it, keyed by its node key here (see conjunctKey; an owner's is its address).
  const { hostedRings, reportRing } = useHostedRings();
  // Which owners are open, by the address of the noun they own: an owner the user opened (still
  // empty, or named) or folded away. Unset, a named owner shows and an empty one doesn't. The
  // period's builder holds it for every owner on its canvas; a hosted ring's builder uses its host's.
  const [periodOwnersOpen, setPeriodOwnersOpen] = useState<Record<NounAddress, boolean>>({});
  const ownersOpen = ringHost?.ownersOpen ?? periodOwnersOpen;
  const setPeriodOwnerOpen = useCallback(
    (address: NounAddress, open: boolean) =>
      setPeriodOwnersOpen((prev) => (prev[address] === open ? prev : { ...prev, [address]: open })),
    [],
  );
  const setOwnerOpen = ringHost?.setOwnerOpen ?? setPeriodOwnerOpen;
  const hasVerb = Boolean(selection.verb);
  const hasSubject = Boolean(selection.subject);
  // Has the user put anything in this clause? An untouched container is `{}`; any picked
  // word, toggle, or nested possessor adds a key. Drives the remove-confirmation prompt.
  const hasContent = Object.values(selection).some(
    (v) => v != null && (typeof v !== "object" || Object.keys(v).length > 0),
  );
  // A canvas is shown once a subject or verb is chosen (a period starts on its subject),
  // or, verbless, for a lone noun phrase (a hosted ring's). An imperative also shows it:
  // its subject is the synthesised addressee (never picked into `selection`), so the canvas
  // gives the greyed subject + addressee selector *and the verb box* — without this the empty
  // state would show only the addressee selector, with no way to add the verb to command.
  // Before that, the empty state offers the single opening word picker.
  // An instrument-as-action period draws its canvas from the start: its first box is the verb,
  // not the subject, so the subject-picking empty state would have nothing to offer.
  // A hosted ring is drawn from the start too: an empty conjunct or owner is its word picker, in its
  // ring.
  const showCanvas =
    Boolean(ringHost) ||
    hasSubject || hasVerb || Boolean(selection.imperative) || Boolean(selection.infinitive) || actionMode;
  // A conjunct's head word plays the role of the noun it is coordinated with, so its ring wears that
  // role's name and colour ("DIRECT OBJECT", in green) rather than its builder's `subject` slot's. An
  // owner's ring is named for what it is, in the colour of the noun it hangs off.
  const hostRole = ringHost && ALL_SLOTS.find((s) => s.key === ringHost.role);
  const roleSlot: Pick<SlotConfig, "label" | "labelKey" | "required" | "color"> | undefined =
    hostRole &&
    (ringHost.kind === "owner"
      ? { label: "Possessor", labelKey: "slot.possessor", required: false, color: hostRole.color }
      : hostRole);
  const visibleSlots = getActiveSlots(
    selection.verb?.transitivity,
    selection.subject?.role,
    Boolean(selection.subjectAdjective),
    selection.verb?.complements,
  )
    // Objects hang off the verb, so a subject-only (verbless) period shows none —
    // otherwise an empty Direct Object box would appear before any verb is chosen.
    .filter((s) => hasVerb || !s.key.startsWith("directObject"))
    .map((s) =>
      roleSlot && s.key === "subject"
        ? { ...s, label: roleSlot.label, labelKey: roleSlot.labelKey, required: roleSlot.required, color: roleSlot.color }
        : s,
    );
  const activeSlotConfig =
    visibleSlots.find((s) => s.key === activeSlot) ?? null;

  function handleConceptSelect(
    concept: Concept,
    targetSlot?: SlotKey,
    opts?: ConceptSelectOpts,
  ) {
    const slot = targetSlot ?? activeSlot;
    if (!slot) return;

    // Re-picking an already-filled box: replace the word in place and don't auto-advance.
    const wasFilled = Boolean(selection[slot]);
    setEditingSlot(null);

    onPhraseUpdate((prev) => applyConceptSelect(prev, slot, concept, opts));

    // Re-picking a filled word keeps focus on it; only a fresh pick auto-advances.
    if (wasFilled) return;
    const next = nextActiveSlot({ slot, concept, selection, visibleSlots });
    if (next !== undefined) setActiveSlot(next);
  }

  function handleSlotClick(slot: SlotKey) {
    setActiveSlot(slot);
  }

  // The effective word-category of a switchable slot: an explicit choice if the user made
  // one, else the held word's own class (so re-picking opens on the right vocabulary), else
  // the slot's default. Returns "" for a single-vocabulary slot (no toggle).
  function kindFor(slot: SlotKey): string {
    const cats = slotCategories(slot);
    if (!cats) return "";
    const stored = slotKindState[slot];
    if (stored != null) return stored;
    const held = selection[slot] as Concept | undefined;
    if (held?.role && cats.options.some((o) => o.value === held.role))
      return held.role;
    return cats.fallback;
  }

  const handleSlotKindChange = (slot: SlotKey, kind: string) =>
    setSlotKindState((prev) => ({ ...prev, [slot]: kind }));

  // Click a filled word box to change its word: select the slot and open its inline
  // picker over the current word (see SlotNode / slotTypeahead `editing`).
  function handleEditSlot(slot: SlotKey) {
    setActiveSlot(slot);
    setEditingSlot(slot);
  }

  // Focus left a box being re-picked without a new word chosen — restore the word.
  function handleCancelEdit(slot: SlotKey) {
    setEditingSlot((cur) => (cur === slot ? null : cur));
  }

  function handleClear(slot: SlotKey) {
    onPhraseUpdate((prev) => applyClear(prev, slot));
    if (slot === "verb") setActiveSlot("verb");
  }

  // Remove a complement entirely: clear its concept/number/gender and collapse
  // its dotted ring (un-reveal so it doesn't linger as an empty group).
  function handleRemoveComplement(type: BoxComplementType) {
    handleClear(type);
    setRevealed((prev) => ({ ...prev, [type]: false }));
    if (activeSlot === type) setActiveSlot("verb");
  }

  // Relative clauses are now cross-container links (see PhraseWorkspace): a noun's
  // "relative clause" satellite starts/removes a link via `binding`, and the target
  // container is folded in at serialization time — no in-selection relative slice.

  // Remove a noun block's owner entirely (a named owner or a pointed-to one) and close it.
  function handleRemovePossessor(which: NounKey) {
    const address = nounAddress(which);
    onPhraseUpdate((prev) => clearPossessorRef(removePossessor(prev, which), which));
    setOwnerOpen(address, false);
    if (coref.picking === address) coref.cancel();
    // Drop any relative-clause link sourced from the owner's head that just vanished.
    binding?.relative.onRemoveLink(possessorAddress(address));
  }

  // The possessor control on a noun's dotted ring. One control fills the owner either way: opening
  // it draws an empty owner ring — its word picker, to name the owner — and lights up the nouns it
  // could point to instead; clicking one of those points to it, and the empty ring goes. Once named,
  // the control folds the owner's ring away and back like any satellite, keeping the owner; a
  // pointed-to owner has no ring to fold, so the control takes it away.
  function handleTogglePossessor(which: NounKey) {
    const address = nounAddress(which);
    if (selection[POSSESSOR_REF_KEY(which)]) {
      handleRemovePossessor(which);
      return;
    }
    const named = Boolean((selection[POSSESSOR_KEY(which)] as PhraseSelection | undefined)?.subject);
    if (ownersOpen[address] ?? named) {
      setOwnerOpen(address, false);
      if (coref.picking === address) coref.cancel();
      return;
    }
    setOwnerOpen(address, true);
    if (!named)
      coref.start(address, (antecedent) =>
        onPhraseUpdate((prev) => setPossessorRef(prev, which, antecedent)),
      );
  }

  // Coordinate one more phrase with a noun block's head ("Peter *and Paul*"). Unlike the
  // possessor, this is not a reveal but an append: each click adds one more ring to the group.
  function handleAddConjunct(which: NounKey) {
    onPhraseUpdate((prev) => addConjunct(prev, which));
  }

  // Drop one conjunct out of a block's group. The conjuncts after it shift up by one, so every
  // relative-clause link sourced from a conjunct at or after `i` is now aimed at the wrong
  // phrase — an address is positional. Rather than renumber them (and silently move a user's
  // clause onto a different noun), drop those links: the conjunct they described is gone or
  // has moved, and re-linking is one click. The rings after it keep the places they had.
  function handleRemoveConjunct(which: NounKey, i: number) {
    const base = nounAddress(which);
    const count = conjunctsOf(selection, which).length;
    for (let j = i; j < count; j++)
      binding?.relative.onRemoveLink(conjunctAddress(base, j));
    onPhraseUpdate((prev) => removeConjunct(prev, which, i));
    setPositions((prev) => dropConjunctPosition(prev, which, i, count));
  }

  const handleCycleConjunction = (which: NounKey) =>
    onPhraseUpdate((prev) => cycleNounConjunction(prev, which));

  // Each grammatical control on the canvas is a pure selection transform (phraseReducers);
  // these bind them to this builder's slice.
  const handleToggleNumber = (which: NumberSlot) =>
    onPhraseUpdate((prev) => toggleNumber(prev, which));
  const handleToggleGender = (which: GenderSlot) =>
    onPhraseUpdate((prev) => toggleGender(prev, which));
  const handleToggleNegative = () => onPhraseUpdate(toggleNegative);
  const handleSetDefiniteness = (which: NounKey, value: Definiteness) =>
    onPhraseUpdate((prev) => setDefiniteness(prev, which, value));
  const handleCycleModifierRelation = (slotKey: SlotKey) =>
    onPhraseUpdate((prev) => cycleModifierRelation(prev, slotKey));
  const handleCycleModifierNumber = (slotKey: SlotKey) =>
    onPhraseUpdate((prev) => cycleModifierNumber(prev, slotKey));
  const handleSetModifierAdjective = (slotKey: SlotKey, concept: Concept | undefined) =>
    onPhraseUpdate((prev) => setModifierAdjective(prev, slotKey, concept));
  const handleCycleDegree = (slotKey: SlotKey) =>
    onPhraseUpdate((prev) => cycleDegree(prev, slotKey));
  const handleCycleTense = () => onPhraseUpdate(cycleTense);
  const handleCycleAspect = () => onPhraseUpdate(cycleAspect);
  const handleToggleImperative = () => {
    onPhraseUpdate(toggleImperative);
    // Switching a command on replaces the subject box with the command box, so focus would
    // otherwise sit on a box that no longer exists. Move it to the verb — the one thing still to
    // pick, and the whole point of a command.
    if (!selection.imperative && !selection.verb) setActiveSlot("verb");
  };
  const handleToggleInfinitive = () => {
    onPhraseUpdate(toggleInfinitive);
    // Switching the infinitive on replaces the subject box with the infinitive box, so move focus
    // to the verb — the citation's whole content — for the same reason the command toggle does.
    if (!selection.infinitive && !selection.verb) setActiveSlot("verb");
  };
  const handleSetImperativePerson = (person: ImperativePerson) =>
    onPhraseUpdate((prev) => setImperativePerson(prev, person));
  const handleSetImperativeRegister = (register: ImperativeRegister) =>
    onPhraseUpdate((prev) => setImperativeRegister(prev, register));
  const handleSelectSpecifier = (spec: PathSpecifier) =>
    onPhraseUpdate((prev) => setSpecifier(prev, spec, "route"));
  const handleSelectLocativeSpecifier = (spec: PathSpecifier) =>
    onPhraseUpdate((prev) => setSpecifier(prev, spec, "locative"));
  const handleSelectSentiment = (sentiment: CauseSentiment) =>
    onPhraseUpdate((prev) => setSentiment(prev, sentiment));

  // An owner's ring is shown while its owner is open, which the period's builder holds (see
  // `ownersOpen`), so that reads in place of the possessor satellite's own reveal.
  const ownerReveals = Object.fromEntries(
    NOUN_KEYS.flatMap((which) => {
      const open = ownersOpen[nounAddress(which)];
      return open === undefined ? [] : [[`${which}Possessor`, open]];
    }),
  );
  const { satellites, shownMap: rawShownMap } = buildSatellites(
    selection,
    { ...revealed, ...ownerReveals },
    uiLanguage,
    t,
  );

  // Hide what the collapsed dotted rings hide — every ring, in compact view.
  const { effectiveCollapsed, collapsedMainKeys, shownMap } = applyCollapse({
    rawShownMap,
    collapsedGroups,
    compact,
  });

  function handleToggleCollapse(label: string) {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function handleToggleReveal(sat: Satellite) {
    const willShow = !sat.shown;
    setRevealed((prev) => ({ ...prev, [sat.key]: willShow }));
    if (willShow && REVEALABLE_SLOT_KEYS.has(sat.key as SlotKey)) {
      setActiveSlot(sat.key as SlotKey);
    }
  }

  // Sort every satellite's control into: its word's solid ring (or, chained, the orbit gap after
  // the satellite before it), the verb phrase's dotted ring (complement toggles), or a noun's
  // dotted ring (relative-clause + possessor controls, which also anchor their connector lines).
  const {
    satelliteIconsByParent,
    complementToggleIcons,
    perimeterByNoun: satellitePerimeter,
    directObjectToggle,
  } = buildSatelliteIcons({
      satellites,
      shownMap,
      collapsedMainKeys,
      linkBinding,
      onToggleNumber: handleToggleNumber,
      onToggleGender: handleToggleGender,
      onToggleNegative: handleToggleNegative,
      onToggleReveal: handleToggleReveal,
      onAddConjunct: ringHost?.onAddConjunct ? () => ringHost.onAddConjunct!() : handleAddConjunct,
    });
  // The group-extending control rides the group's last ring; each possessor control names or points
  // to its noun's owner.
  const perimeterByNoun = decoratePerimeterControls({
    perimeterByNoun: satellitePerimeter,
    selection,
    ringHost,
    resolve: coref.resolve,
    onTogglePossessor: handleTogglePossessor,
  });

  // Satellite slots (adjective / adverb) only render when revealed or filled; the direct
  // object, only while its own control on the verb-phrase box has it unfolded.
  const renderedSlots = visibleSlots.filter(
    (s) => !REVEALABLE_SLOT_KEYS.has(s.key) || shownMap[s.key],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >(() => ({ ...DEFAULT_POSITIONS }));
  const { dragRef, draggingKey, makeDragProps, makeGroupDragProps } = useDrag({
    positions,
    setPositions,
    containerRef,
    // Compact paints the boxes where its packing puts them, so there is nothing to drag.
    frozen: compact,
  });
  const [graphHeight, setGraphHeight] = useStoredNumber("signi:graphHeight", GRAPH_HEIGHT, MIN_GRAPH_HEIGHT);

  // Rebase node y's when the canvas height changes (see useHeightRebase). Must stay above
  // the overlap resolver, which reads the stale flag in the same commit.
  const positionsStaleRef = useHeightRebase({ graphHeight, setPositions, dragRef });
  // The canvas's rendered size. The canvas only mounts once `showCanvas` flips, so the
  // observer re-attaches on that.
  const svgSize = useElementSize(containerRef, { w: 600, h: GRAPH_HEIGHT }, showCanvas);
  // The period's header controls, which compact view floats over the canvas's top-right corner.
  const periodControlsRef = useRef<HTMLDivElement>(null);
  const controlsCorner = useCornerOverlap(periodControlsRef, containerRef, compact, showCanvas);
  const { slotEls, boxSizes, sizeOf } = useBoxSizes();
  useGeometryNotify(binding?.geometry.onGeometryChange, {
    positions,
    boxSizes,
    svgSize,
    graphHeight,
    collapsedGroups,
    compact,
  });

  // The constituents on the canvas, and which of their satellites are shown.
  const groups = roleGroups({
    drawCanvas: showCanvas,
    // An `object`-level instrument holds a bare noun phrase, not a clause: no verb phrase, no
    // objects.
    nounPhrase: nounPhraseMode,
    // The possessor's own head is a word on this canvas; in a relative clause the subject is the
    // external head, so it isn't drawn — and neither is an instrument act's, which is the acting
    // clause's subject, not one of its own.
    showSubject: !actionMode,
    visibleSlots,
    shownMap,
  })
    // A hosted ring's builder draws one ring — its phrase's — and that ring drops the phrase: a
    // conjunct out of its group, an owner off the noun it owns.
    .map((g) =>
      ringHost
        ? { ...g, removable: true, ...(roleSlot && { color: MUI_COLOR_HEX[roleSlot.color] }) }
        : g,
    );

  // The coordinated nouns whose ring is on this canvas: each draws its conjuncts' rings after its
  // own. (A hosted ring's builder hosts none — every ring is the period canvas's.)
  const chains = ringHost
    ? []
    : openConjunctsFor(selection)
        .filter((which) => groups.some((g) => g.mainKey === which))
        .map((which) => ({ which, count: conjunctsOf(selection, which).length }));

  // The owners on this canvas, however deep — an owner's owner, a conjunct's — and the nouns that
  // point to theirs. The period's own nouns may take one wherever their possessor control is offered.
  const { owners, pointers } = ringHost
    ? { owners: [], pointers: [] }
    : possessionsFor({
        selection,
        nouns: groups
          .map((g) => g.mainKey as NounKey)
          .filter((k) => satellites.some((sat) => sat.key === `${k}Possessor` && sat.available)),
        chains,
        ownersOpen,
      });

  // Compact-view layout, derived (not stored) each render: pack the visible core words
  // into centered rows and size the canvas to just wrap them. Because it's recomputed
  // from the current width every render, it never goes stale on a resize, and the stored
  // full-view positions/height stay pristine for when compact turns back off. The core
  // words are exactly `renderedSlots` in compact (satellites are already filtered out).
  // The packing keeps clear of the period's controls, which reserve no room of their own.
  // Each cell is big enough for the biggest solid ring and the clear button straddling it.
  // A coordinated noun's conjuncts are packed straight after it, each in a cell of its own, and each
  // ring's owners straight after that ring.
  const withOwners = (key: string): string[] => [
    key,
    ...owners.filter((o) => o.possessedKey === key).flatMap((o) => withOwners(o.address)),
  ];
  const compactKeys = renderedSlots.flatMap((s) => {
    const chain = chains.find((c) => c.which === s.key);
    return (chain ? chainKeys(chain.which, chain.count) : [s.key]).flatMap(withOwners);
  });
  const ringHalf =
    Math.max(
      0,
      ...groups.map((g) => innerRadius(sizeOf(g.mainKey))),
      ...compactKeys.map((k) => hostedRings[k]?.rIn ?? 0),
    ) + BUTTON_HALF;
  const cellHalfW = Math.max(COMPACT_PAD_H, Math.ceil(ringHalf));
  const cellHalfH = Math.max(COMPACT_PAD_V, Math.ceil(ringHalf));
  const compactLayout = React.useMemo(
    () =>
      // A hosted ring's builder has no canvas of its own to pack: its ring is placed by the period's.
      compact && !ringHost
        ? computeCompactLayout(
            compactKeys,
            svgSize.w,
            controlsCorner,
            { halfW: cellHalfW, halfH: cellHalfH },
          )
        : null,
    // The keys are a fresh array every render; what they spell is what the packing depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compact, Boolean(ringHost), compactKeys.join(), svgSize.w, controlsCorner, cellHalfW, cellHalfH],
  );

  // Canvas height + the size the rings are laid out against: the tight compact height when
  // compact, else the (resizable) full-view height. Both the group rects and the box %
  // positions are computed against this same height, so they stay consistent.
  //
  // The height is taken from state rather than from the measured `svgSize`, which is a
  // ResizeObserver behind by a frame: when the overlap resolver grows the container to
  // hold a box it pushed down, it has to see the height it just asked for, or it re-reads
  // the old one and pushes the box down again.
  const canvasHeight = compactLayout ? compactLayout.height : graphHeight;
  const graphSize = ringHost?.graphSize ?? { w: svgSize.w, h: canvasHeight };

  // The Paper's padding, in theme spacing units. The resize grip negates it to sit flush
  // with the container's bottom border, so the two must stay in step.
  const paperPad = compact ? 1 : 2;

  // Where a constituent's word sits: its stored position, or the compact packing while compact.
  // A hosted ring's builder paints its one word where the period's canvas puts it.
  const { wordPos, centerOf } = wordPlacement({
    at: ringHost?.at,
    compactPositions: compactLayout?.positions,
    positions,
    graphSize,
    chains,
    owners,
  });

  // Where each noun's possessor control faces while the noun has an owner: the owner's ring, or the
  // bend of the line to the noun it points to. The line to the owner leaves from the control.
  const possessorToward = (key: string): Pt | undefined => {
    const owner = owners.find((o) => o.possessedKey === key);
    if (owner) return centerOf(owner.address);
    const target = pointers.find((p) => p.possessedKey === key)?.antecedentKey;
    return target && (groups.some((g) => g.mainKey === target) || hostedRings[target])
      ? pointerBend(centerOf(key), centerOf(target))
      : undefined;
  };

  // The port on each coordinated noun's dotted ring that the line to its first conjunct leaves from.
  const headLinkPorts: Record<string, { key: string; toward: Pt }[]> = Object.fromEntries(
    chains.map(({ which }) => {
      const first = conjunctKey(which, 0);
      return [which, [{ key: chainPortKey(which, first), toward: centerOf(first) }]];
    }),
  );

  // The words whose solid ring carries a clear button: a chosen word that is not a link target's
  // greyed endpoint, not open for re-picking, and not the subject a mood has replaced.
  const moodSubject = Boolean(selection.imperative || selection.infinitive);
  const clearable = new Set(
    groups
      .map((g) => g.mainKey)
      .filter(
        (k) =>
          Boolean(selection[k as SlotKey]) &&
          !linkBinding?.relative.targetKeys.has(k as NounKey) &&
          editingSlot !== k &&
          !(k === "subject" && moodSubject),
      ),
  );

  // Seat every satellite and control on its constituent's rings (see ringSpecs / ringLayout).
  const { groupRects, discs, controlPos } = buildRings({
    groups,
    specs: buildRingSpecs({
      groups,
      compact,
      satelliteIconsByParent,
      complementToggleIcons,
      directObjectToggle,
      perimeterByNoun,
      linkTargetKeys: linkBinding?.relative.targetKeys,
      clearable,
      toolbars: {
        ...(selection.route && { route: PATH_SPECIFIERS }),
        ...(selection.locative && { locative: PATH_SPECIFIERS }),
        ...(selection.cause && { cause: CAUSE_SENTIMENTS }),
      },
      centerOf,
      linkPorts: ringHost ? { subject: ringHost.ports } : headLinkPorts,
      possessorAims: ringHost
        ? ringHost.possessorToward && { subject: ringHost.possessorToward }
        : Object.fromEntries(
            groups.flatMap((g) => {
              const toward = possessorToward(g.mainKey);
              return toward ? [[g.mainKey, toward]] : [];
            }),
          ),
    }),
    centerOf,
    sizeOf,
    compact,
  });

  // Where a node sits, in % of the canvas: a satellite where its orbit seats it, a word where
  // it was put.
  function pos(key: string) {
    const disc = discs[key];
    if (disc) return { x: (disc.x / graphSize.w) * 100, y: (disc.y / graphSize.h) * 100 };
    return wordPos(key);
  }
  // A satellite is dragged by its constituent: pressing its disc moves the whole ring.
  const dragKeyOf = (key: string) =>
    groups.find((g) => g.nodeKeys.includes(key))?.mainKey ?? key;

  // ── Coordination on this canvas ──
  // Each conjunct's ring as one more constituent here — kept clear of the others, and packed by a
  // tidy — once its builder has reported drawing it.
  const headOf = (which: NounKey) => groupRects.find((g) => g.mainKey === which);
  const conjunctRects = chains.flatMap(({ which, count }) => {
    const head = headOf(which);
    if (!head) return [];
    return Array.from({ length: count }, (_, i) => conjunctKey(which, i)).flatMap((key, i) => {
      const ring = hostedRings[key];
      if (!ring) return [];
      return [hostedRect({ key, color: head.color, kind: "conjunct", head: head.label, index: i, center: centerOf(key), ring, compact })];
    });
  });

  // ── Possession on this canvas ──
  // Each owner's ring as one more constituent here, once its builder has reported drawing it.
  const ownerRects = owners.flatMap((spot) => {
    const ring = hostedRings[spot.address];
    const head = headOf(spot.role);
    if (!ring || !head) return [];
    return [
      hostedRect({
        key: spot.address,
        color: head.color,
        kind: "owner",
        head: head.label,
        index: spot.order,
        center: centerOf(spot.address),
        ring,
        compact,
      }),
    ];
  });
  const canvasRects = [...groupRects, ...conjunctRects, ...ownerRects];

  const { edges, groupEdges } = buildEdges({
    groupRects,
    discs,
    controlPos,
    complementToggleIcons,
    directObjectToggle,
    compact,
    standIns: Object.fromEntries(
      chains.flatMap(({ which }) => {
        const head = headOf(which);
        return head ? [[head.label, conjunctRects.filter((r) => r.conjunct?.head === head.label)]] : [];
      }),
    ),
  });
  // The lines joining each group's rings, drawn like the lines to the verb phrase; the chip on each
  // says how the group is joined.
  const links = conjunctLinks({
    chains,
    centerOf,
    headRing: headOf,
    headPort: (port) => controlPos[port],
    rings: hostedRings,
    compact,
  });
  const linkEdges: Edge[] = links.map((link) => ({
    x1: link.from.x,
    y1: link.from.y,
    x2: link.to.x,
    y2: link.to.y,
    color: headOf(link.which)?.color ?? "",
    dashed: false,
  }));

  // The rings on this canvas and the controls on them, its own constituents' and the hosted ones'.
  const { ringOf, controlOn } = ringLookup({ groupRects, hostedRings, controlPos, centerOf });
  const possessorControlOn = (key: string) =>
    controlOn(key, perimeterControlKey("possessor", key), perimeterControlKey("possessor", "subject"));
  // The port an owner's ring faces the ring it owns from.
  const ownerPort = (spot: OwnerSpot) => portKey(spot.address, spot.possessedKey);
  const possessionColor = (role: NounKey) => headOf(role)?.color ?? "";

  // The line from each noun to its owner's ring…
  const ownerEdges: Edge[] = owners.flatMap((spot) => {
    const link = ownerLink({
      owned: ringOf(spot.possessedKey),
      owner: ringOf(spot.address),
      control: possessorControlOn(spot.possessedKey),
      port: controlOn(spot.address, ownerPort(spot)),
      compact,
    });
    return link
      ? [{ x1: link.from.x, y1: link.from.y, x2: link.to.x, y2: link.to.y, color: possessionColor(spot.role), dashed: false }]
      : [];
  });
  // …and the dashed line from each noun that points to its owner, with the pronoun it renders.
  const pointerLinks = pointers.flatMap((spot) => {
    const link = pointerLink({
      owned: ringOf(spot.possessedKey),
      antecedent: spot.antecedentKey ? ringOf(spot.antecedentKey) : undefined,
      control: possessorControlOn(spot.possessedKey),
      compact,
    });
    if (!link) return [];
    const resolved = coref.resolve(spot.antecedent);
    return [
      {
        spot,
        link,
        pronoun: resolved && possessiveHintEn(resolved.features),
        color: possessionColor(spot.role),
      },
    ];
  });
  const possessionEdges: Edge[] = [
    ...ownerEdges,
    ...pointerLinks.map(({ link, color }) => ({
      x1: link.from.x,
      y1: link.from.y,
      x2: link.to.x,
      y2: link.to.y,
      via: link.via,
      color,
      dashed: true,
    })),
  ];

  // What every hosted ring borrows from this canvas alike.
  const hosting = {
    graphSize,
    compact,
    draggingKey,
    makeDragProps,
    makeGroupDragProps,
    ownersOpen,
    setOwnerOpen,
  };

  // What conjunct `i` of `which` borrows from this canvas to draw its ring here.
  const hostFor = (which: NounKey, i: number): RingHost => {
    const count = chains.find((c) => c.which === which)?.count ?? 0;
    const keys = chainKeys(which, count);
    const key = keys[i + 1];
    const neighbours = [keys[i], keys[i + 2]].filter((k): k is string => Boolean(k));
    return {
      ...hosting,
      kind: "conjunct",
      key,
      role: which,
      at: wordPos(key),
      ports: neighbours.map((n) => ({ key: chainPortKey(key, n), toward: centerOf(n) })),
      possessorToward: possessorToward(key),
      onRing: (ring) => reportRing(key, ring),
      isLast: i === count - 1,
      onAddConjunct: () => handleAddConjunct(which),
    };
  };

  // What an owner borrows from this canvas to draw its ring here.
  const ownerHostFor = (spot: OwnerSpot): RingHost => ({
    ...hosting,
    kind: "owner",
    key: spot.address,
    role: spot.role,
    at: wordPos(spot.address),
    ports: [{ key: ownerPort(spot), toward: centerOf(spot.possessedKey) }],
    possessorToward: possessorToward(spot.address),
    onRing: (ring) => reportRing(spot.address, ring),
  });

  // Take an owner off the noun it owns. Relative clauses sourced from it, or from an owner it holds,
  // go with it; so does where its rings were, so that one opened again starts beside its noun.
  function handleRemoveOwner(spot: OwnerSpot) {
    const gone = ownersUnder(owners, spot.address);
    onPhraseUpdate((prev) =>
      updateNounAt(prev, spot.possessed, (slice, which) => clearPossessorRef(removePossessor(slice, which), which)),
    );
    setOwnerOpen(spot.possessed, false);
    if (coref.picking === spot.possessed) coref.cancel();
    for (const o of gone) binding?.relative.onRemoveLink(o.address);
    setPositions((prev) => {
      const next = { ...prev };
      for (const o of gone) delete next[o.address];
      return next;
    });
  }

  // Naming an owner settles it: once its ring holds a word, the nouns lit up to point to instead go
  // dark.
  useEffect(() => {
    if (ringHost || !coref.picking) return;
    if (owners.some((o) => o.possessed === coref.picking && o.named)) coref.cancel();
  });

  // A hosted ring's builder tells the period's canvas about the ring it just drew, and that it is gone.
  useReportOwnRing(ringHost, ringHost ? groupRects[0] : undefined, controlPos);

  // The clear button on each word's solid ring.
  const clearControls = [...clearable].map((mainKey) => {
    const slot = visibleSlots.find((s) => s.key === mainKey);
    return {
      mainKey,
      label: slot?.label ?? mainKey,
      labelKey: slot?.labelKey,
      onClear: () => handleClear(mainKey as SlotKey),
    };
  });

  // Place each hosted ring the first time it appears, in the stored (full-view) positions, so the ring
  // has somewhere to be dragged from even while compact view packs it elsewhere.
  useHostedRingPlacement({
    enabled: !ringHost,
    chains,
    owners,
    positions,
    groupRects,
    hostedRings,
    canvas: { w: svgSize.w, h: graphHeight },
    setPositions,
    setGraphHeight,
  });

  // Keep the rings clear of each other, growing the canvas when a shove needs room
  // (see useOverlapResolution).
  useOverlapResolution({
    compact,
    // A hosted ring's builder has only its own ring, which the period's canvas keeps clear.
    groupRects: ringHost ? [] : canvasRects,
    pos,
    graphSize,
    graphHeight,
    setPositions,
    setGraphHeight,
    dragRef,
    positionsStaleRef,
    // An owner's empty ring is its word picker for as long as it takes to name or point to the owner:
    // it moves out of the other rings' way rather than shoving them, since pointing makes it vanish.
    yielding: new Set(owners.filter((o) => !o.named).map((o) => o.address)),
  });

  // Tidy the whole period: pack the constituents' rings into non-overlapping rows in reading
  // order: subject · verb phrase · direct object · complements. Collapse state is left alone;
  // one click re-flows the container into a clean grid without hiding anything the user had
  // revealed.
  function handleTidyPeriod() {
    if (groupRects.length === 0) return;
    const { positions: packed, height } = packPeriod(canvasRects, graphSize);
    setPositions((prev) => ({ ...prev, ...packed }));
    // Fit the container to the grid we just laid out — growing when expanded boxes need
    // more room than the canvas has, and shrinking when they need less, so tidying clears
    // the dead space under the content instead of leaving it behind. The rebase onto the
    // new height (rescaleYForHeight) holds every pixel offset, so the grid stays put.
    const fitted = Math.max(MIN_GRAPH_HEIGHT, height);
    if (fitted !== graphHeight) setGraphHeight(fitted);
  }

  // Compact / expand the whole period. This is a pure view toggle: the compact packing
  // and shrunk canvas height are *derived* each render (see compactLayout below), so the
  // stored full-view positions and graphHeight are left untouched — expanding just falls
  // straight back to them, and the compact layout can never go stale on a resize.
  function handleToggleCompact() {
    setCompact((c) => !c);
  }

  // Shared bag passed to the verb/noun phrase builders — they all paint onto the
  // same canvas below and lean on this component's drag machinery and handlers.
  const ctx: PhraseRenderContext = {
    selection,
    nounPhrase: nounPhraseMode,
    pronounHead: ringHost?.kind === "conjunct",
    showSubject: !actionMode,
    activeSlot,
    renderedSlots,
    shownMap,
    satelliteIconsByParent,
    complementToggleIcons,
    directObjectToggle,
    groupRects,
    discs,
    controlPos,
    collapsedGroups: effectiveCollapsed,
    compact,
    // A conjunct's ring is dragged about its head's canvas, by the key it goes by there.
    draggingKey: ringHost ? ringHost.draggingKey : draggingKey,
    // Painted where `pos` says — on the orbit, or the compact packing — not at the stored
    // position; a satellite drags its whole constituent.
    makeDragProps: (key, onActivate) =>
      ringHost
        ? ringHost.makeDragProps(key, onActivate, pos(key), ringHost.key)
        : makeDragProps(key, onActivate, pos(key), dragKeyOf(key)),
    makeGroupDragProps: ringHost
      ? () => ringHost.makeGroupDragProps([ringHost.key])
      : makeGroupDragProps,
    slotEls,
    handleSlotClick,
    editingSlot,
    handleEditSlot,
    handleCancelEdit,
    handleConceptSelect,
    slotKind: kindFor,
    onSlotKindChange: handleSlotKindChange,
    handleClear,
    handleToggleNumber,
    handleToggleGender,
    handleSetDefiniteness,
    handleCycleModifierRelation,
    handleCycleModifierNumber,
    handleSetModifierAdjective,
    handleCycleDegree,
    handleToggleNegative,
    handleCycleTense,
    handleCycleAspect,
    handleSelectSpecifier,
    handleSelectLocativeSpecifier,
    handleSelectSentiment,
    handleToggleCollapse,
    handleRemoveComplement,
    removeRing:
      ringHost && onRemove
        ? {
            title: ringHost.kind === "owner" ? "Remove this possessor" : "Remove this conjunct",
            onRemove,
          }
        : undefined,
    // Cross-container linking: forward noun boxes to the workspace registry and expose
    // greying (link targets) + pick-mode (eligible targets). Only NOUN_KEYS participate.
    onBoxRef: linkBinding
      ? (key, el) => {
          if (NOUN_KEYS.includes(key as NounKey))
            linkBinding.geometry.registerBox(key as NounKey, el);
        }
      : undefined,
    dimmedKeys: linkBinding
      ? (linkBinding.relative.targetKeys as Set<string>)
      : undefined,
    // A noun box lights up as a pick target for either an in-progress relative-clause link
    // (cross-container) or a pronominal-possessor coref pick (same period). The coref pick takes
    // precedence while active, since the two never run at once.
    isPickTarget: (key) => {
      if (!NOUN_KEYS.includes(key as NounKey)) return false;
      if (coref.picking) return coref.isEligible(nounAddress(key as NounKey));
      return Boolean(linkBinding?.relative.isPickTarget(key as NounKey));
    },
    onPickTarget: (key) => {
      if (coref.picking && NOUN_KEYS.includes(key as NounKey)) {
        coref.pick(nounAddress(key as NounKey));
        return;
      }
      linkBinding?.relative.onPick(key as NounKey);
    },
    // The instrumental toggle on the verb phrase's dotted ring is where an instrumental link
    // starts, so the workspace measures its connector from there.
    registerVerbAnchor: linkBinding?.geometry.registerVerbAnchor,
  };

  // The clause-level connector controls on the card border, derived from the workspace binding
  // (undefined for a standalone period). See periodControls in PeriodContainer.tsx.
  const clauseControls = nested ? {} : periodControls(binding, selection);

  const canvas = (
    <PhraseCanvas
      ctx={ctx}
      showCanvas={showCanvas}
      canvasHeight={canvasHeight}
      graphSize={graphSize}
      edges={edges}
      groupEdges={[...groupEdges, ...linkEdges, ...possessionEdges]}
      controlPos={controlPos}
      clearControls={clearControls}
      perimeterByNoun={perimeterByNoun}
      linkBinding={linkBinding}
      onSetImperativePerson={handleSetImperativePerson}
      onSetImperativeRegister={handleSetImperativeRegister}
      containerRef={containerRef}
      recolor={roleSlot ? { subject: roleSlot.color } : undefined}
      overlay={Boolean(ringHost)}
      hosted={
        <>
          {chains.length > 0 && (
            <ConjunctRings
              chains={chains}
              selection={selection}
              onPhraseUpdate={onPhraseUpdate}
              onRemoveConjunct={handleRemoveConjunct}
              onCycleConjunction={handleCycleConjunction}
              hostFor={hostFor}
              links={links}
              binding={binding}
              possessorPath={possessorPath}
              Builder={PhraseBuilder}
            />
          )}
          {(owners.length > 0 || pointerLinks.length > 0) && (
            <OwnerRings
              owners={owners}
              pointers={pointerLinks}
              selection={selection}
              onPhraseUpdate={onPhraseUpdate}
              onRemoveOwner={handleRemoveOwner}
              hostFor={ownerHostFor}
              binding={binding}
              Builder={PhraseBuilder}
            />
          )}
        </>
      }
    />
  );

  // A hosted ring's builder paints its ring onto the period's canvas. It wears no card of its own.
  if (ringHost) return canvas;

  // The card's contents — the canvas and its resize grip.
  const content = (
    <>
      {canvas}

      {/* The container's own bottom edge is the resize grip, so it bleeds back through
          the Paper's padding. No manual resize while compact — the canvas is auto-sized
          to hug the chips, and the resizer's tall minimum would fight that. */}
      {!compact && (
        <Box sx={{ mt: 2, mx: -paperPad, mb: -paperPad }}>
          <Resizer
            height={graphHeight}
            minHeight={MIN_GRAPH_HEIGHT}
            onResize={setGraphHeight}
            onResizeEnd={(h) => {
              localStorage.setItem("signi:graphHeight", String(Math.round(h)));
            }}
          />
        </Box>
      )}
    </>
  );

  const tree = (
    <Box
      data-testid="period-container"
      data-container-id={binding?.containerId}
      sx={{
        position: position ? "fixed" : "relative",
        ...(position && { left: `${position.x}px`, top: `${position.y}px` }),
        zIndex: position ? 50 : "auto",
      }}
    >
      <PeriodContainer
        paperPad={paperPad}
        compact={compact}
        showCanvas={showCanvas}
        hasGroups={groupRects.length > 0}
        hasContent={hasContent}
        soleContainer={soleContainer}
        nested={nested}
        // A workspace container stays in the managed stack so the cross-container
        // connectors measure correctly; only a standalone period may be floated.
        floatable={!binding && !nested}
        position={position}
        onPositionChange={setPosition}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onSave={onSave}
        onRemove={onRemove}
        onToggleCompact={handleToggleCompact}
        onTidy={handleTidyPeriod}
        controlsRef={periodControlsRef}
        conditional={clauseControls.conditional}
        coordinative={clauseControls.coordinative}
        instrumental={clauseControls.instrumental}
        imperative={
          nested
            ? undefined
            : {
                active: Boolean(selection.imperative),
                // An imperative is a mood: mutually exclusive with a conditional, and shared by
                // the two clauses of a coordination. Either way the mood can't be flipped on this
                // period alone while it takes part in one — the relation has to be cleared first.
                disabled: binding
                  ? binding.conditional.hasSource ||
                    binding.conditional.hasTarget ||
                    binding.coordinative.hasSource ||
                    binding.coordinative.hasTarget
                  : false,
                onToggle: handleToggleImperative,
              }
        }
        infinitive={
          nested
            ? undefined
            : {
                active: Boolean(selection.infinitive),
                // Like the imperative, the infinitive is a mood occupying the finite slot, so it
                // can't be flipped on a period that takes part in a conditional or a coordination
                // — clear the relation first.
                disabled: binding
                  ? binding.conditional.hasSource ||
                    binding.conditional.hasTarget ||
                    binding.coordinative.hasSource ||
                    binding.coordinative.hasTarget
                  : false,
                onToggle: handleToggleInfinitive,
              }
        }
      >
        {content}
      </PeriodContainer>

      {/* The words panel is the page's, opened from its header: only the outermost period
          has one. */}
      {!nested && (
        <PhraseSidebar
          open={wordsPanelOpen}
          onClose={() => onWordsPanelClose?.()}
          width={sidebarWidth}
          onWidthChange={setSidebarWidth}
          selection={selection}
          activeSlot={activeSlot}
          activeSlotConfig={activeSlotConfig}
          visibleSlots={visibleSlots}
          onSlotClick={handleSlotClick}
          onConceptSelect={handleConceptSelect}
        />
      )}
    </Box>
  );

  // The outermost period builder provides the coref-pick coordinator to its whole subtree; a
  // nested builder inherited `parentCoref` and re-provides nothing.
  return parentCoref ? (
    tree
  ) : (
    <CorefPickContext.Provider value={ownCoref}>{tree}</CorefPickContext.Provider>
  );
}
