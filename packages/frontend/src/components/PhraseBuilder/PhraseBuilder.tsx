import React, { useRef, useState } from "react";
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
  slotCategories,
  SlotKey,
  WorkspaceBinding,
} from "./interfaces.ts";
import {
  ALL_SLOTS,
  COLLAPSIBLE_GROUPS,
  NOUN_KEYS,
  REVEALABLE_SLOT_KEYS,
  SATELLITE_SLOT_KEYS,
  getActiveSlots,
  isModalSlot,
  DEFAULT_POSITIONS,
  GRAPH_HEIGHT,
  MIN_GRAPH_HEIGHT,
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
import { buildEdges, buildRings, roleGroups } from "./graph.ts";
import { buildRingSpecs } from "./ringSpecs.ts";
import { BUTTON_HALF, innerRadius } from "./ringLayout.ts";
import { type PhraseRenderContext } from "./phraseRender.tsx";
import { PhraseCanvas } from "./PhraseCanvas.tsx";
import { PhraseSidebar } from "./PhraseSidebar.tsx";
import { Resizer } from "./Resizer.tsx";
import { openPossessorsFor, PossessorPanels } from "./PossessorPanels.tsx";
import { CorefPickContext, useCorefPick, useProvideCorefPick } from "./CorefPickContext.tsx";
import { ConjunctPanels, openConjunctsFor } from "./ConjunctPanels.tsx";
import { PeriodContainer, periodControls } from "./PeriodContainer.tsx";
import { RelativePhraseConnectors } from "./RelativePhraseConnectors.tsx";
import { useDrag } from "./hooks/useDrag.ts";
import { useHeightRebase } from "./hooks/useHeightRebase.ts";
import { useElementSize } from "./hooks/useElementSize.ts";
import { useCornerOverlap } from "./hooks/useCornerOverlap.ts";
import { useBoxSizes } from "./hooks/useBoxSizes.ts";
import { usePanelConnectors } from "./hooks/usePanelConnectors.ts";
import { useGeometryNotify } from "./hooks/useGeometryNotify.ts";
import { useOverlapResolution } from "./hooks/useOverlapResolution.ts";
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
  // top-level container in the workspace; forwarded (unchanged) into embedded possessor
  // sub-builders so their head can source a cross-container relative-clause link too.
  containerId?: string;
  binding?: WorkspaceBinding;
  // The workspace address of *this* builder's head noun, set only when this builder is an
  // embedded possessor sub-builder (its head lives in the `subject` slot). It names the
  // possessor head within the owning container — e.g. `directObject/possessor` — so the
  // head can anchor a link. Undefined for a top-level container (its nouns are their own
  // plain addresses). See `linkBinding` / `possessorAddress`.
  possessorPath?: NounAddress;
  /**
   * This builder edits a bare noun phrase, so it shows no predicate — the subject box and its
   * satellites, nothing else. Set for a *conjunct* panel: a conjunct is one phrase of a
   * coordinated noun element ("Peter and **Paul**"), and a phrase has no verb of its own.
   *
   * A possessor sub-builder deliberately does *not* set it. A possessor is a whole noun phrase
   * in its own right and may well head a clause — "the boy who cried wolf's fox" — so it keeps
   * the full canvas.
   */
  nounPhraseOnly?: boolean;
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
  // A possessor or conjunct panel: a noun phrase inside a period, not a period of its own. It
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
  // A conjunct panel is the other bare-noun-phrase canvas (see `nounPhraseOnly`).
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
  const [compact, setCompact] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem("signi:phraseBuilderSidebarWidth");
    return saved ? Number(saved) : 160;
  });
  // Where a standalone period card has been dragged to by its border, in viewport pixels;
  // null while it sits in the page flow. The drag itself lives in PeriodContainer, but the
  // state is held here because this component's outer Box is what goes `fixed`.
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const hasVerb = Boolean(selection.verb);
  const hasSubject = Boolean(selection.subject);
  // Has the user put anything in this clause? An untouched container is `{}`; any picked
  // word, toggle, or nested possessor adds a key. Drives the remove-confirmation prompt.
  const hasContent = Object.values(selection).some(
    (v) => v != null && (typeof v !== "object" || Object.keys(v).length > 0),
  );
  // A canvas is shown once a subject or verb is chosen (a period starts on its subject),
  // or, verbless, for a lone noun phrase (the possessor editor). An imperative also shows it:
  // its subject is the synthesised addressee (never picked into `selection`), so the canvas
  // gives the greyed subject + addressee selector *and the verb box* — without this the empty
  // state would show only the addressee selector, with no way to add the verb to command.
  // Before that, the empty state offers the single opening word picker.
  // An instrument-as-action period draws its canvas from the start: its first box is the verb,
  // not the subject, so the subject-picking empty state would have nothing to offer.
  const showCanvas =
    hasSubject || hasVerb || Boolean(selection.imperative) || Boolean(selection.infinitive) || actionMode;
  const visibleSlots = getActiveSlots(
    selection.verb?.transitivity,
    selection.subject?.role,
    Boolean(selection.subjectAdjective),
    selection.verb?.complements,
  )
    // Objects hang off the verb, so a subject-only (verbless) period shows none —
    // otherwise an empty Direct Object box would appear before any verb is chosen.
    .filter((s) => hasVerb || !s.key.startsWith("directObject"));
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

    onPhraseUpdate((prev) => {
      const next = applyConceptSelect(prev, slot, concept);
      // The pronoun chooser commits its plurality/gender decision alongside the
      // concept; override the defaults applyConceptSelect seeded.
      if (opts?.number !== undefined)
        (next as PhraseSelection)[`${slot}Number` as keyof PhraseSelection] =
          opts.number as never;
      if (opts?.gender !== undefined)
        (next as PhraseSelection)[`${slot}Gender` as keyof PhraseSelection] =
          opts.gender as never;
      return next;
    });

    // Re-picking a filled word keeps focus on it; only a fresh pick auto-advances.
    if (wasFilled) return;

    // Auto-advance to next empty slot (only among the main, always-visible slots)
    let slots = visibleSlots;
    if (slot === "verb") {
      slots = getActiveSlots(
        concept.transitivity,
        selection.subject?.role,
        Boolean(selection.subjectAdjective),
        concept.complements,
      );
      // A subject-dropping mood (command / infinitive citation) has no subject box to land on, so
      // after the verb the focus advances to the object instead of the dropped subject.
      const subjectDropped = Boolean(selection.imperative || selection.infinitive);
      const subjectEmpty = !selection.subject && !subjectDropped;
      setActiveSlot(
        subjectEmpty
          ? "subject"
          : (slots.find(
              (s) =>
                s.key !== "verb" &&
                s.key !== "subject" &&
                !SATELLITE_SLOT_KEYS.has(s.key) &&
                !selection[s.key],
            )?.key ?? null),
      );
    } else if (/Adjective\d?$/.test(slot) || isModalSlot(slot)) {
      // Setting an adjective or a modal just closes the picker; the next link in the
      // chain is opened explicitly, from the control this box now carries.
      setActiveSlot(null);
    } else {
      const currentIdx = slots.findIndex((s) => s.key === slot);
      const nextSlot = slots
        .slice(currentIdx + 1)
        .find((s) => !SATELLITE_SLOT_KEYS.has(s.key) && !selection[s.key]);
      if (nextSlot) setActiveSlot(nextSlot.key);
    }
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

  // Remove a noun block's possessor entirely (genitive phrase or pronominal reference) and
  // collapse its reveal.
  function handleRemovePossessor(which: NounKey) {
    onPhraseUpdate((prev) => clearPossessorRef(removePossessor(prev, which), which));
    setRevealed((prev) => ({ ...prev, [`${which}Possessor`]: false }));
    // Drop any relative-clause link sourced from the possessor head that just vanished.
    binding?.relative.onRemoveLink(possessorAddress(nounAddress(which)));
  }

  // Coordinate one more phrase with a noun block's head ("Peter *and Paul*"). Unlike the
  // possessor, this is not a reveal but an append: each click opens one more conjunct panel.
  function handleAddConjunct(which: NounKey) {
    onPhraseUpdate((prev) => addConjunct(prev, which));
  }

  // Drop one conjunct out of a block's group. The panels below it shift up by one, so every
  // relative-clause link sourced from a conjunct at or after `i` is now aimed at the wrong
  // phrase — an address is positional. Rather than renumber them (and silently move a user's
  // clause onto a different noun), drop those links: the conjunct they described is gone or
  // has moved, and re-linking is one click.
  function handleRemoveConjunct(which: NounKey, i: number) {
    const base = nounAddress(which);
    const count = conjunctsOf(selection, which).length;
    for (let j = i; j < count; j++)
      binding?.relative.onRemoveLink(conjunctAddress(base, j));
    onPhraseUpdate((prev) => removeConjunct(prev, which, i));
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

  const { satellites, shownMap: rawShownMap } = buildSatellites(
    selection,
    revealed,
    uiLanguage,
    t,
  );

  // Effective collapse state: compact view collapses every group at once; otherwise
  // just the individually-collapsed ones. Everything downstream (shown map, group
  // rects, the collapse icon, the drag guard) reads this rather than `collapsedGroups`.
  const effectiveCollapsed: Record<string, boolean> = compact
    ? Object.fromEntries(COLLAPSIBLE_GROUPS.map((g) => [g.label, true]))
    : collapsedGroups;

  // Collapse: force every child node of a collapsed group hidden. Because group
  // rects, rendered slots, and edges all derive from shownMap, forcing these
  // false shrinks each collapsed box down to just its main word.
  const collapsedHiddenKeys = new Set<string>();
  const collapsedMainKeys = new Set<string>();
  for (const g of COLLAPSIBLE_GROUPS) {
    if (!effectiveCollapsed[g.label]) continue;
    collapsedMainKeys.add(g.mainKey);
    for (const k of g.childKeys) collapsedHiddenKeys.add(k);
  }
  const shownMap = collapsedHiddenKeys.size
    ? {
        ...rawShownMap,
        ...Object.fromEntries([...collapsedHiddenKeys].map((k) => [k, false])),
      }
    : rawShownMap;

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
    perimeterByNoun,
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
      onAddConjunct: handleAddConjunct,
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
  const [graphHeight, setGraphHeight] = useState<number>(() => {
    const saved = localStorage.getItem("signi:graphHeight");
    return saved ? Math.max(MIN_GRAPH_HEIGHT, Number(saved)) : GRAPH_HEIGHT;
  });

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
  const openPossessors = openPossessorsFor(selection, shownMap);
  const openConjuncts = openConjunctsFor(selection);
  const {
    rootRef,
    possessorControlEls,
    possessorDotEls,
    conjunctControlEls,
    conjunctDotEls,
    relConnectors,
  } = usePanelConnectors({
    openPossessors,
    openConjuncts,
    collapsedGroups: effectiveCollapsed,
  });
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
  });

  // Compact-view layout, derived (not stored) each render: pack the visible core words
  // into centered rows and size the canvas to just wrap them. Because it's recomputed
  // from the current width every render, it never goes stale on a resize, and the stored
  // full-view positions/height stay pristine for when compact turns back off. The core
  // words are exactly `renderedSlots` in compact (satellites are already filtered out).
  // The packing keeps clear of the period's controls, which reserve no room of their own.
  // Each cell is big enough for the biggest solid ring and the clear button straddling it.
  const ringHalf =
    Math.max(0, ...groups.map((g) => innerRadius(sizeOf(g.mainKey)))) + BUTTON_HALF;
  const cellHalfW = Math.max(COMPACT_PAD_H, Math.ceil(ringHalf));
  const cellHalfH = Math.max(COMPACT_PAD_V, Math.ceil(ringHalf));
  const compactLayout = React.useMemo(
    () =>
      compact
        ? computeCompactLayout(
            renderedSlots.map((s) => s.key),
            svgSize.w,
            controlsCorner,
            { halfW: cellHalfW, halfH: cellHalfH },
          )
        : null,
    [compact, renderedSlots, svgSize.w, controlsCorner, cellHalfW, cellHalfH],
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
  const graphSize = { w: svgSize.w, h: canvasHeight };

  // The Paper's padding, in theme spacing units. The resize grip negates it to sit flush
  // with the container's bottom border, so the two must stay in step.
  const paperPad = compact ? 1 : 2;

  // Where a constituent's word sits: its stored position, or the compact packing while compact.
  // The word is the centre of its rings; everything else on the constituent is placed round it.
  const wordPos = (key: string) =>
    compactLayout?.positions[key] ?? positions[key] ?? DEFAULT_POSITIONS[key];
  const centerOf = (key: string) => {
    const p = wordPos(key);
    return { x: (p.x / 100) * graphSize.w, y: (p.y / 100) * graphSize.h };
  };

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

  const { edges, groupEdges } = buildEdges({
    groupRects,
    discs,
    controlPos,
    complementToggleIcons,
    directObjectToggle,
    compact,
  });

  // The clear button on each word's solid ring.
  const clearControls = [...clearable].map((mainKey) => ({
    mainKey,
    label: ALL_SLOTS.find((s) => s.key === mainKey)?.label ?? mainKey,
    onClear: () => handleClear(mainKey as SlotKey),
  }));

  // Keep the rings clear of each other, growing the canvas when a shove needs room
  // (see useOverlapResolution).
  useOverlapResolution({
    compact,
    groupRects,
    pos,
    graphSize,
    graphHeight,
    setPositions,
    setGraphHeight,
    dragRef,
    positionsStaleRef,
  });

  // Tidy the whole period: pack the constituents' rings into non-overlapping rows in reading
  // order: subject · verb phrase · direct object · complements. Collapse state is left alone;
  // one click re-flows the container into a clean grid without hiding anything the user had
  // revealed.
  function handleTidyPeriod() {
    if (groupRects.length === 0) return;
    const { positions: packed, height } = packPeriod(groupRects, graphSize);
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
    draggingKey,
    // Painted where `pos` says — on the orbit, or the compact packing — not at the stored
    // position; a satellite drags its whole constituent.
    makeDragProps: (key, onActivate) =>
      makeDragProps(key, onActivate, pos(key), dragKeyOf(key)),
    makeGroupDragProps,
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

  // The card's contents — the canvas, its resize grip, and any docked possessor panels.
  const content = (
    <>
      <PhraseCanvas
        ctx={ctx}
        showCanvas={showCanvas}
        canvasHeight={canvasHeight}
        graphSize={graphSize}
        edges={edges}
        groupEdges={groupEdges}
        controlPos={controlPos}
        clearControls={clearControls}
        perimeterByNoun={perimeterByNoun}
        linkBinding={linkBinding}
        onSetImperativePerson={handleSetImperativePerson}
        onSetImperativeRegister={handleSetImperativeRegister}
        containerRef={containerRef}
        possessorControlEls={possessorControlEls}
        conjunctControlEls={conjunctControlEls}
      />

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

      {showCanvas && (
        <PossessorPanels
          openPossessors={openPossessors}
          selection={selection}
          onPhraseUpdate={onPhraseUpdate}
          onRemovePossessor={handleRemovePossessor}
          registerDot={(which, el) => {
            if (el) possessorDotEls.current.set(which, el);
            else possessorDotEls.current.delete(which);
          }}
          binding={binding}
          possessorPath={possessorPath}
          coref={coref}
          corefAddr={nounAddress}
          Builder={PhraseBuilder}
        />
      )}

      {showCanvas && (
        <ConjunctPanels
          openConjuncts={openConjuncts}
          selection={selection}
          onPhraseUpdate={onPhraseUpdate}
          onRemoveConjunct={handleRemoveConjunct}
          onCycleConjunction={handleCycleConjunction}
          registerDot={(which, el) => {
            if (el) conjunctDotEls.current.set(which, el);
            else conjunctDotEls.current.delete(which);
          }}
          binding={binding}
          possessorPath={possessorPath}
          Builder={PhraseBuilder}
        />
      )}
    </>
  );

  const tree = (
    <Box
      ref={rootRef}
      data-testid="period-container"
      data-container-id={binding?.containerId}
      sx={{
        position: position ? "fixed" : "relative",
        ...(position && { left: `${position.x}px`, top: `${position.y}px` }),
        zIndex: position ? 50 : "auto",
      }}
    >
      <RelativePhraseConnectors connectors={relConnectors} />
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
