import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { CAUSE_SENTIMENTS, OBJECT_PREDICATIONS, PATH_SPECIFIERS, TEMPORAL_RELATIONS, type Concept } from "@signi/shared";
import {
  BoxComplementType,
  adaptPossessorBinding,
  ConceptSelectOpts,
  imperativePerson,
  imperativeRegisterOf,
  NounAddress,
  NounKey,
  PhraseSelection,
  builderNounAddress,
  conjunctAddress,
  possessorAddress,
  SlotKey,
  WorkspaceBinding,
} from "./interfaces.ts";
import {
  NOUN_KEYS,
  REVEALABLE_SLOT_KEYS,
  DEFAULT_POSITIONS,
  GRAPH_HEIGHT,
  MIN_GRAPH_HEIGHT,
  MUI_COLOR_HEX,
  nounOnlyConjunct,
} from "./slots.ts";
import {
  applyConceptSelect,
  applyClear,
  conjunctsOf,
  removeConjunct,
  removePossessor,
  clearPossessorRef,
  setPossessorRef,
  updateNounAt,
  toggleImperative,
  toggleInfinitive,
  toggleInterrogative,
} from "./phraseReducers.ts";
import { moodLocked } from "./functions/moodLocked.ts";
import {
  buildSatelliteIcons,
  buildSatellites,
  type Satellite,
} from "./satellites/index.ts";
import { packPeriod } from "./layout.ts";
import { buildEdges, buildRings, linkEdge, roleGroups, type Edge } from "./graph.ts";
import { buildRingSpecs } from "./ringSpecs.ts";
import { toPercent, type Pt } from "./ringLayout.ts";
import { type PhraseRenderContext } from "./phraseRender.tsx";
import { PhraseCanvas } from "./PhraseCanvas.tsx";
import { PhraseSidebar } from "./PhraseSidebar.tsx";
import {
  CorefPickContext,
  useCorefPick,
  useProvideCorefPick,
} from "./CorefPickContext.tsx";
import { ConjunctRings } from "./ConjunctRings.tsx";
import { OwnerRings } from "./OwnerRings.tsx";
import type { RingHost } from "./ringHost.ts";
import {
  chainPortKey,
  conjunctKey,
  conjunctLinks,
  dropConjunctPosition,
} from "./conjunctChain.ts";
import { ownersUnder, possessionsFor, type OwnerSpot } from "./ownerChain.ts";
import { standardLink, standardSpotFor } from "./standardRing.ts";
import { possessiveRequests } from "./functions/possessiveRequests.ts";
import { usePossessivePhrases } from "../../i18n/usePossessivePhrase.ts";
import { PeriodCard } from "./PeriodCard.tsx";
import { GRAPH_HEIGHT_KEY, SIDEBAR_WIDTH_KEY } from "./storageKeys.ts";
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
import { useSlotFocus } from "./hooks/useSlotFocus.ts";
import { useOwnersOpen } from "./hooks/useOwnersOpen.ts";
import { useCompactLayout } from "./hooks/useCompactLayout.ts";
import { useSettleCorefPick } from "./hooks/useSettleCorefPick.ts";
import { nextActiveSlot } from "./functions/nextActiveSlot.ts";
import { applyCollapse } from "./functions/applyCollapse.ts";
import { decoratePerimeterControls } from "./functions/decoratePerimeterControls.ts";
import { ringLookup, wordPlacement } from "./functions/canvasGeometry.ts";
import { resolveBuilderMode } from "./functions/resolveBuilderMode.ts";
import { renderedSlotsFor, rendersPassive, roleSlotFor, visibleSlotsFor } from "./functions/visibleSlots.ts";
import { phraseCommands } from "./functions/phraseCommands.ts";
import { possessorToggleAction } from "./functions/possessorToggleAction.ts";
import { canvasChains, ownableNouns } from "./functions/canvasNouns.ts";
import { compactPacking } from "./functions/compactPacking.ts";
import { possessorAims } from "./functions/possessorAims.ts";
import { clearableKeys, clearControlsFor } from "./functions/clearControls.ts";
import { hostedRectsFor } from "./functions/hostedRects.ts";
import { possessionEdges } from "./functions/possessionEdges.ts";
import { ringHosts } from "./functions/ringHosts.ts";
import { linkPickHandlers } from "./functions/linkPickHandlers.ts";
import { useUiLanguage } from "../../i18n/LanguageContext.tsx";
import { useConceptLabel } from "../../i18n/useConceptLabel.ts";
import { useUiString } from "../../i18n/useUiString.ts";
import { BoxScopeProvider, useBoxScope } from "../../keyboard/KeyboardProvider.tsx";
import { pressControl } from "../../keyboard/controls.ts";
import { usePickKeys } from "../../keyboard/usePickKeys.ts";
import { satelliteKey as satelliteKeyFor, type BoxContext } from "../../keyboard/keymap.ts";
import { boxScopesOf, nounBlockOf } from "../../keyboard/scope.ts";
import { markKey, periodMark, useConsoleMarks } from "../../console/ConsoleMarks.tsx";

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
  // Top-level only: the workspace's own two buttons under the stack. The period's N and L reach
  // them without leaving the card (see the keymap's period scope).
  onAddPeriod?: () => void;
  onLoadPeriod?: () => void;
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
  onAddPeriod,
  onLoadPeriod,
  wordsPanelOpen = false,
  onWordsPanelClose,
  binding,
  possessorPath,
  nounPhraseOnly = false,
  ringHost,
}: PhraseBuilderProps) {
  const { uiLanguage } = useUiLanguage();
  const t = useUiString();
  // The antecedent's word in the UI language, for the possessor control that points at it.
  const word = useConceptLabel();
  // When this builder edits a possessor (a `possessorPath` naming its head), wrap the
  // container's `binding` so the sub-builder can link like any container: its internal head
  // key `"subject"` is mapped onto the possessor address, and it is never itself a link
  // *target* (a possessor head can only *source* a relative clause today). Top-level
  // containers use their `binding` unchanged.
  const linkBinding: WorkspaceBinding | undefined =
    binding && possessorPath
      ? adaptPossessorBinding(binding, possessorPath)
      : binding;
  // A period of its own, another clause's instrument, or a hosted ring's noun phrase — and so
  // whether it draws a canvas yet (see resolveBuilderMode).
  const { nounPhraseMode, actionMode, showCanvas, hasContent } = resolveBuilderMode({
    selection,
    binding,
    possessorPath,
    nounPhraseOnly,
    hosted: Boolean(ringHost),
  });
  // Coref-pick coordinator for pronominal possessors ("the boy and his horse"). The outermost
  // period builder owns one (keyed to the whole period selection) and re-provides it below; a
  // nested conjunct / possessor builder inherits the parent's, so a pick spans the whole tree.
  const parentCoref = useCorefPick();
  const ownCoref = useProvideCorefPick(selection);
  const coref = parentCoref ?? ownCoref;
  // Pointing at the noun a pronominal possessor stands for ("the boy and **his** horse") is a pick
  // like any other: its eligible nouns are numbered where they sit, a digit takes one, and esc
  // abandons it — which it had no way to do at all. The period's own builder owns the pick, so it
  // owns the keys; a nested conjunct's or owner's builder inherits the pick and binds nothing.
  usePickKeys({
    active: !parentCoref && Boolean(ownCoref.picking),
    onPick: (target) => target.click(),
    onCancel: ownCoref.cancel,
  });
  // Map a local noun key to its period-root address (what a coref reference stores / points at,
  // and what a link is keyed by): a top-level builder's keys are themselves, a nested builder's
  // head "subject" is its `possessorPath`, and its other nouns sit under that (see
  // builderNounAddress). The same mapping `adaptPossessorBinding` applies.
  const nounAddress = (key: NounKey): NounAddress => builderNounAddress(possessorPath, key);
  // The slot in hand, the box open for re-picking, and each switchable box's word-category.
  const {
    activeSlot,
    setActiveSlot,
    editingSlot,
    setEditingSlot,
    selectSlot,
    editSlot,
    cancelEdit,
    slotKind,
    setSlotKind,
  } = useSlotFocus(selection);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  // Which noun's determiner menu is open. Held here rather than in the noun's own renderer so the
  // noun's D key can open it from wherever the cursor is (see the keymap's noun.determiner).
  const [determinerMenuFor, setDeterminerMenuFor] = useState<NounKey | null>(null);
  // The verb's *Add a complement* menu, opened by + from the verb box.
  const [complementMenuOpen, setComplementMenuOpen] = useState(false);
  // The complement whose relation toolbar is listening for a key, armed by S from its box. The
  // toolbar is always on the ring, so it is not opened — only pointed at (see RelationToolbar).
  const [toolbarFor, setToolbarFor] = useState<SlotKey | null>(null);
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
  const [sidebarWidth, setSidebarWidth] = useStoredNumber(SIDEBAR_WIDTH_KEY, 160);
  // The rings hosted on this canvas — conjuncts' and owners' — as each one's builder reports drawing
  // it, keyed by its node key here (see conjunctKey; an owner's is its address).
  const { hostedRings, reportRing } = useHostedRings();
  const { ownersOpen, setOwnerOpen } = useOwnersOpen(ringHost);
  // Whether the predicate adjective's standard of comparison is open — its ring drawn: what the user
  // last asked its control for; unset, a named standard shows and an empty one doesn't (P09-E12 D5).
  const [standardOpen, setStandardOpen] = useState<boolean | undefined>(undefined);
  // A hosted ring's head slot wears its role's name and colour (see roleSlotFor).
  const roleSlot = roleSlotFor(ringHost);
  const visibleSlots = visibleSlotsFor(selection, roleSlot);
  const activeSlotConfig =
    visibleSlots.find((s) => s.key === activeSlot) ?? null;
  const commands = phraseCommands(onPhraseUpdate);
  // What the phrase console shows on this builder's boxes, and the box it is told the pointer is on.
  // A box is named by its period, the nested phrase it is in (a hosted ring's head path), and its slot.
  const marks = useConsoleMarks();
  const markedContainer = binding?.containerId;
  const consoleMark =
    marks && markedContainer
      ? (slot: SlotKey) => {
          const key = markKey(markedContainer, possessorPath, slot);
          return {
            key,
            preview: marks.preview.has(key),
            lit: marks.lit.has(key),
            cursor: marks.cursor === key,
            number: marks.numbers.get(key),
          };
        }
      : undefined;
  const onHoverSlot =
    marks && markedContainer
      ? (slot: SlotKey | null) =>
          marks.onHover(slot ? { containerId: markedContainer, slice: possessorPath, slot } : null)
      : undefined;

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

    // Re-picking a filled word keeps the cursor on it; only a fresh pick auto-advances.
    if (wasFilled) {
      focusSlot(slot);
      return;
    }
    const next = nextActiveSlot({ slot, concept, selection, visibleSlots });
    // Auto-advancing lands in the next empty box, whose picker takes the cursor as it opens. Where
    // there is nothing to advance to — the last word of the period, or a chained adjective or modal
    // whose next link is opened from this very box — the picker just closes, and the cursor stays
    // on the word chosen rather than falling off the canvas with the picker that carried it.
    if (next) setActiveSlot(next);
    else focusSlot(slot);
  }

  function handleClear(slot: SlotKey) {
    onPhraseUpdate((prev) => applyClear(prev, slot));
    if (slot === "verb") setActiveSlot("verb");
    // The predicative's standard goes with it (see clearNoun), and the next one starts folded.
    if (slot === "predicative" || slot === "verb") setStandardOpen(undefined);
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

  // The possessor control on a noun's dotted ring (see possessorToggleAction).
  function handleTogglePossessor(which: NounKey) {
    const address = nounAddress(which);
    switch (possessorToggleAction(selection, which, ownersOpen[address])) {
      case "remove":
        handleRemovePossessor(which);
        return;
      case "fold":
        setOwnerOpen(address, false);
        if (coref.picking === address) coref.cancel();
        return;
      case "open":
        setOwnerOpen(address, true);
        return;
      case "openAndPick":
        setOwnerOpen(address, true);
        coref.start(address, (antecedent) =>
          onPhraseUpdate((prev) => setPossessorRef(prev, which, antecedent)),
        );
    }
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
  // The question keeps the subject box (a question has a subject), so the cursor stays where it is.
  const handleToggleQuestion = () => onPhraseUpdate(toggleInterrogative);

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
    {
      // A question mark that would make the period a question respects the lock the border's toggle does.
      moodLocked: moodLocked(binding),
      // A that-clause this period governs is its verb's object, so the object box gives way to it.
      clauseObject: binding?.subordinate.asSource?.kind === "content",
    },
  );

  // The key each satellite's control answers to, read off the keymap for the scope of the box that
  // carries it (see keymap.satelliteKey). Built here so a control never has to know the keymap:
  // it is handed its key, and can therefore never advertise one that is not bound.
  const satelliteKeys: Record<string, string> = {};
  for (const sat of satellites) {
    const key = satelliteKeyFor(sat.key, boxScopesOf(sat.parent, selection));
    if (key) satelliteKeys[sat.key] = key;
  }

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
      onToggleNumber: commands.handleToggleNumber,
      onToggleGender: commands.handleToggleGender,
      onToggleNegative: commands.handleToggleNegative,
      onToggleReveal: handleToggleReveal,
      onAddConjunct: ringHost?.onAddConjunct ? () => ringHost.onAddConjunct!() : commands.handleAddConjunct,
      onCyclePossessorRole: (which: NounKey) => commands.handleCyclePossessorRole(which),
      // A hosted ring's phrase is a noun phrase, not a clause: it asks nothing and states no existence.
      ...(!ringHost && {
        onToggleQuestion: commands.handleToggleQuestion,
        onToggleQuestionAnimate: commands.handleToggleQuestionAnimate,
        onToggleExistential: commands.handleToggleExistential,
        onCycleGloss: () => commands.handleCycleGloss(1),
        onCycleGlossRelation: () => commands.handleCycleGlossRelation(1),
      }),
      t,
    });
  const renderedSlots = renderedSlotsFor(visibleSlots, shownMap);

  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >(() => ({ ...DEFAULT_POSITIONS }));
  const { dragRef, draggingKey, makeDragProps, makeGroupDragProps, nudge } = useDrag({
    positions,
    setPositions,
    containerRef,
    // Compact paints the boxes where its packing puts them, so there is nothing to drag.
    frozen: compact,
  });
  const [graphHeight, setGraphHeight] = useStoredNumber(GRAPH_HEIGHT_KEY, GRAPH_HEIGHT, MIN_GRAPH_HEIGHT);

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

  // A box the keyboard asked for, which may not be on the canvas yet: revealing a satellite puts
  // it there in the *next* commit, so the request is held and honoured once the box exists.
  const pendingFocus = useRef<SlotKey | null>(null);
  useEffect(() => {
    const want = pendingFocus.current;
    if (!want) return;
    const el = slotEls.current.get(want);
    if (!el) return;
    pendingFocus.current = null;
    // A newly revealed empty box opens its picker, which autofocuses: the cursor is already
    // inside, and pulling it back out to the box would undo that.
    if (!el.contains(document.activeElement)) el.focus();
  });

  /** Put the cursor on a box of this phrase, once it is there to be put on. */
  function focusSlot(slotKey: SlotKey) {
    setActiveSlot(slotKey);
    pendingFocus.current = slotKey;
  }

  const satelliteBy = (key: string) => satellites.find((sat) => sat.key === key);

  /** Show a satellite's box if it is folded away, and move the cursor into it. */
  function revealSlot(slotKey: SlotKey, satelliteKey?: string) {
    const sat = satelliteKey ? satelliteBy(satelliteKey) : undefined;
    if (sat && !sat.shown) handleToggleReveal(sat);
    focusSlot(slotKey);
  }

  /** Show or hide a satellite's box, leaving the cursor where it is (the object's fold-away). */
  function toggleRevealByKey(satelliteKey: string) {
    const sat = satelliteBy(satelliteKey);
    if (sat) handleToggleReveal(sat);
  }

  /** Reveal a noun's determiner box if it is folded away, then open its menu. */
  function openDeterminerMenu(which: NounKey | null) {
    if (which) {
      const sat = satelliteBy(`${which}Definiteness`);
      if (sat && !sat.shown) handleToggleReveal(sat);
    }
    setDeterminerMenuFor(which);
  }

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
    // A passive renames two of the groups, as it renames the word boxes inside them (A01).
    passive: rendersPassive(selection),
  })
    // A hosted ring's builder draws one ring — its phrase's — and that ring drops the phrase: a
    // conjunct out of its group, an owner off the noun it owns.
    .map((g) =>
      ringHost
        ? { ...g, removable: true, ...(roleSlot && { color: MUI_COLOR_HEX[roleSlot.color] }) }
        : g,
    );

  // The coordinated nouns whose ring is on this canvas. (A hosted ring's builder hosts none — every
  // ring is the period canvas's.)
  const chains = ringHost ? [] : canvasChains(selection, groups);

  // The predicate adjective's standard of comparison, when its ring is drawn (P09-E12 D5). A hosted
  // ring's builder draws none: only a period has a predicative.
  const standard = ringHost ? undefined : standardSpotFor({ selection, groups, open: standardOpen });

  // The owners on this canvas, however deep — an owner's owner, a conjunct's, a standard's — and the
  // nouns that point to theirs. The period's own nouns may take one wherever their possessor control
  // is offered.
  const { owners, pointers } = ringHost
    ? { owners: [], pointers: [] }
    : possessionsFor({ selection, nouns: ownableNouns(groups, satellites), chains, ownersOpen, standard });
  // Every hosted ring placed beside the ring it hangs off: the standard first — its owners are
  // placed beside it — then the owners, parents first.
  const besideSpots = standard ? [standard, ...owners] : owners;

  // The possessed noun phrase each coreference link renders ("his horse", fr "son cheval"), which
  // the backend renders on request: the Romance possessive agrees with the noun possessed, so no
  // catalog entry can hold it (C16). Both the chip on the link and the control's tooltip read it.
  const possessivePhrase = usePossessivePhrases(
    possessiveRequests(selection, pointers, coref.resolve),
  );

  // The group-extending control rides the group's last ring; each possessor control names or points
  // to its noun's owner.
  const decorated = decoratePerimeterControls({
    perimeterByNoun: satellitePerimeter,
    selection,
    ringHost,
    resolve: coref.resolve,
    onTogglePossessor: handleTogglePossessor,
    word,
    possessivePhrase,
    t,
  });
  // The standard control opens the standard's ring (an empty one is its word picker) and folds it
  // away again, keeping its word; the ring's own remove control takes the standard off.
  const standardControl = decorated.predicative?.standard;
  const perimeterByNoun = standardControl
    ? {
        ...decorated,
        predicative: {
          ...decorated.predicative,
          standard: { ...standardControl, active: Boolean(standard), onToggle: handleToggleStandard },
        },
      }
    : decorated;

  // What compact view packs, and in how big a cell (see compactPacking). A hosted ring's builder has
  // no canvas of its own to pack: its ring is placed by the period's.
  const packing = compactPacking({ renderedSlots, chains, owners: besideSpots, groups, sizeOf, hostedRings });
  const compactLayout = useCompactLayout({
    enabled: compact && !ringHost,
    keys: packing.keys,
    width: svgSize.w,
    corner: controlsCorner,
    cell: packing.cell,
  });

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

  // Where a constituent's word sits: its stored position, or the compact packing while compact.
  // A hosted ring's builder paints its one word where the period's canvas puts it.
  const { wordPos, centerOf } = wordPlacement({
    at: ringHost?.at,
    compactPositions: compactLayout?.positions,
    positions,
    graphSize,
    chains,
    owners: besideSpots,
  });

  // Where each noun's possessor control faces while the noun has an owner.
  const aims = possessorAims({ owners, pointers, groups, hostedRings, centerOf });

  // The port on each coordinated noun's dotted ring that the line to its first conjunct leaves from.
  const headLinkPorts: Record<string, { key: string; toward: Pt }[]> = Object.fromEntries(
    chains.map(({ which }) => {
      const first = conjunctKey(which, 0);
      return [which, [{ key: chainPortKey(which, first), toward: centerOf(first) }]];
    }),
  );

  const clearable = clearableKeys({
    groups,
    selection,
    linkTargetKeys: linkBinding?.relative.targetKeys,
    editingSlot,
  });

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
        ...(selection.direction && { direction: ["to", ...PATH_SPECIFIERS] }),
        ...(selection.temporal && { temporal: TEMPORAL_RELATIONS }),
        ...(selection.cause && { cause: CAUSE_SENTIMENTS }),
        ...(selection.objectPredicative && { objectPredicative: OBJECT_PREDICATIONS }),
      },
      centerOf,
      linkPorts: ringHost ? { subject: ringHost.ports } : headLinkPorts,
      possessorAims: ringHost
        ? ringHost.possessorToward && { subject: ringHost.possessorToward }
        : aims.byGroup,
      standardAims: standard ? { predicative: centerOf(standard.address) } : undefined,
    }),
    centerOf,
    sizeOf,
    compact,
  });

  // Where a node sits, in % of the canvas: a satellite where its orbit seats it, a word where
  // it was put.
  function pos(key: string) {
    const disc = discs[key];
    return disc ? toPercent(disc, graphSize) : wordPos(key);
  }
  // A satellite is dragged by its constituent: pressing its disc moves the whole ring.
  const dragKeyOf = (key: string) =>
    groups.find((g) => g.nodeKeys.includes(key))?.mainKey ?? key;

  // ⇧ + an arrow shifts the box under the cursor, by the same rule a drag follows: a satellite
  // moves its whole constituent, and a hosted ring's builder moves its ring on the period's canvas.
  const nudgeSlot = (key: string, dx: number, dy: number) =>
    ringHost ? ringHost.nudge(ringHost.key, dx, dy) : nudge(dragKeyOf(key), dx, dy);

  // The hosted rings as constituents of this canvas, once their builders have reported drawing them.
  const headOf = (which: NounKey) => groupRects.find((g) => g.mainKey === which);
  const { conjunctRects, ownerRects, standardRects, standIns } = hostedRectsFor({
    chains,
    owners,
    standard,
    groupRects,
    hostedRings,
    centerOf,
    compact,
  });
  const canvasRects = [...groupRects, ...conjunctRects, ...ownerRects, ...standardRects];

  const { edges, groupEdges } = buildEdges({
    groupRects,
    discs,
    controlPos,
    complementToggleIcons,
    directObjectToggle,
    compact,
    standIns,
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
  const linkEdges: Edge[] = links.map((link) => linkEdge(link, headOf(link.which)?.color ?? "", false));

  // The rings on this canvas and the controls on them, its own constituents' and the hosted ones'.
  const { ringOf, controlOn } = ringLookup({ groupRects, hostedRings, controlPos, centerOf });
  // The lines from each noun to its owner, and to the noun it points to.
  const possession = possessionEdges({
    owners,
    pointers,
    ringOf,
    controlOn,
    colorOf: (role) => headOf(role)?.color ?? "",
    resolve: coref.resolve,
    t,
    possessivePhrase,
    compact,
  });
  // The line from the predicate adjective to its standard of comparison.
  const standardLine = standard && standardLink({ spot: standard, ringOf, controlOn, compact });
  const standardEdges: Edge[] = standardLine ? [linkEdge(standardLine, headOf("predicative")?.color ?? "", false)] : [];

  // What each hosted ring borrows from this canvas to draw its ring here.
  const { conjunctHost, ownerHost, standardHost } = ringHosts({
    hosting: {
      graphSize,
      compact,
      draggingKey,
      makeDragProps,
      makeGroupDragProps,
      nudge,
      ownersOpen,
      setOwnerOpen,
    },
    chains,
    wordPos,
    centerOf,
    possessorToward: aims.toward,
    reportRing,
    onAddConjunct: commands.handleAddConjunct,
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

  // The standard control on the predicative's dotted ring: open the standard's ring, or fold it away.
  function handleToggleStandard() {
    setStandardOpen(!standard);
  }

  // Take the standard off the predicate adjective. Relative clauses sourced from it, or from an owner
  // it holds, go with it; so does where its rings were.
  function handleRemoveStandard() {
    if (!standard) return;
    const gone = [standard, ...ownersUnder(owners, standard.address)];
    commands.handleRemoveStandard();
    setStandardOpen(false);
    for (const o of gone) binding?.relative.onRemoveLink(o.address);
    setPositions((prev) => {
      const next = { ...prev };
      for (const o of gone) delete next[o.address];
      return next;
    });
  }

  // Naming an owner ends the pick that offered to point to one instead.
  useSettleCorefPick({ enabled: !ringHost, coref, owners });

  // A hosted ring's builder tells the period's canvas about the ring it just drew, and that it is gone.
  useReportOwnRing(ringHost, ringHost ? groupRects[0] : undefined, controlPos);

  // The clear button on each word's solid ring.
  const clearControls = clearControlsFor({ clearable, visibleSlots, onClear: handleClear });

  // Place each hosted ring the first time it appears, in the stored (full-view) positions, so the ring
  // has somewhere to be dragged from even while compact view packs it elsewhere.
  useHostedRingPlacement({
    enabled: !ringHost,
    chains,
    owners: besideSpots,
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
    yielding: new Set(besideSpots.filter((o) => !o.named).map((o) => o.address)),
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
  // and shrunk canvas height are *derived* each render (see useCompactLayout), so the
  // stored full-view positions and graphHeight are left untouched — expanding just falls
  // straight back to them, and the compact layout can never go stale on a resize.
  function handleToggleCompact() {
    setCompact((c) => !c);
  }

  /** Fold or unfold the dotted group a box sits in, if it heads one (the box-level Z). */
  function toggleCollapseAt(slotKey: SlotKey) {
    const group = groupRects.find((g) => g.nodeKeys.includes(slotKey));
    if (group) handleToggleCollapse(group.label);
  }

  // What a key pressed on one of this phrase's boxes acts on: the box, the selection round it, and
  // the very handlers the controls' clicks call. Rebuilt on every render and published through a
  // scope the boxes below sit in, so a command always runs against the current selection rather
  // than the one that happened to be in hand when the cursor arrived (see KeyboardProvider).
  const boxScope = useBoxScope((slot: SlotKey): BoxContext | null => {
    if (!renderedSlots.some((s) => s.key === slot)) return null;
    return {
      slot,
      path: possessorPath,
      selection,
      nounKey: nounBlockOf(slot),
      satellite: satelliteBy,
      revealSlot,
      toggleReveal: toggleRevealByKey,
      editSlot,
      clearSlot: handleClear,
      removeComplement: handleRemoveComplement,
      togglePossessor: handleTogglePossessor,
      toggleStandard: handleToggleStandard,
      addConjunct: ringHost?.onAddConjunct
        ? () => ringHost.onAddConjunct!()
        : commands.handleAddConjunct,
      cycleConjunction: commands.handleCycleConjunction,
      relative: (() => {
        const which = nounBlockOf(slot);
        // Only a noun that carries the control at all, and only in a workspace: a standalone
        // period has no other period to point at.
        if (!which || !linkBinding || !satelliteBy(`${which}Relative`)?.available) return undefined;
        const address = possessorPath ? possessorAddress(nounAddress(which)) : nounAddress(which);
        return {
          has: linkBinding.relative.sourceKeys.has(address),
          start: () => linkBinding.relative.onStartLink(address),
          clear: () => linkBinding.relative.onRemoveLink(address),
          headless: linkBinding.relative.headlessKeys.has(address),
          setHeadless: (headless: boolean) => linkBinding.relative.onSetHeadless(address, headless),
        };
      })(),
      openDeterminerMenu,
      openComplementMenu: () => setComplementMenuOpen(true),
      armToolbar: setToolbarFor,
      setImperativePerson: commands.handleSetImperativePerson,
      setImperativeRegister: commands.handleSetImperativeRegister,
      imperative: { person: imperativePerson(selection), register: imperativeRegisterOf(selection) },
      toggleNumber: commands.handleToggleNumber,
      toggleGender: commands.handleToggleGender,
      toggleNegative: commands.handleToggleNegative,
      toggleCauseNegative: commands.handleToggleCauseNegative,
      toggleQuestion: commands.handleToggleQuestion,
      toggleQuestionAnimate: commands.handleToggleQuestionAnimate,
      toggleExistential: commands.handleToggleExistential,
      cycleTense: commands.handleCycleTense,
      cycleGloss: commands.handleCycleGloss,
      cyclePossessorRole: commands.handleCyclePossessorRole,
      cycleGlossRelation: commands.handleCycleGlossRelation,
      cycleAspect: commands.handleCycleAspect,
      cycleVoice: commands.handleCycleVoice,
      cycleDegree: commands.handleCycleDegree,
      cycleModifierRelation: commands.handleCycleModifierRelation,
      cycleModifierNumber: commands.handleCycleModifierNumber,
      // The chip is its own popover's anchor, so the key presses the chip rather than the chip's
      // open state being lifted out of the leaf that owns it (see phraseRender's chip).
      openModifierAdjective: (slotKey) => pressControl(`modifierAdjective:${slotKey}`),
      toggleCollapse: toggleCollapseAt,
      nudge: nudgeSlot,
    };
  });

  // Shared bag passed to the verb/noun phrase builders — they all paint onto the
  // same canvas below and lean on this component's drag machinery and handlers.
  const ctx: PhraseRenderContext = {
    selection,
    nounPhrase: nounPhraseMode,
    // A conjunct may be a pronoun ("you and I"), and so may a standard ("bigger than him") — but not a
    // role's conjunct, a noun as the role's head is (P09-E44).
    pronounHead: (ringHost?.kind === "conjunct" && !nounOnlyConjunct(ringHost.role)) || ringHost?.kind === "standard",
    // …and a predicate's conjunct takes an adjective, as the predicate does (P13).
    predicateHead: ringHost?.kind === "conjunct" && ringHost.role === "predicative",
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
    handleSlotClick: selectSlot,
    editingSlot,
    handleEditSlot: editSlot,
    handleCancelEdit: cancelEdit,
    handleConceptSelect,
    slotKind,
    onSlotKindChange: setSlotKind,
    handleClear,
    handleToggleNumber: commands.handleToggleNumber,
    handleToggleGender: commands.handleToggleGender,
    handleSetDefiniteness: commands.handleSetDefiniteness,
    handleCycleModifierRelation: commands.handleCycleModifierRelation,
    handleCycleModifierNumber: commands.handleCycleModifierNumber,
    handleSetModifierAdjective: commands.handleSetModifierAdjective,
    handleCycleDegree: commands.handleCycleDegree,
    handleToggleNegative: commands.handleToggleNegative,
    handleCycleTense: commands.handleCycleTense,
    handleCycleAspect: commands.handleCycleAspect,
    handleCycleVoice: commands.handleCycleVoice,
    handleSelectSpecifier: commands.handleSelectSpecifier,
    handleSelectLocativeSpecifier: commands.handleSelectLocativeSpecifier,
    handleSelectTemporalRelation: commands.handleSelectTemporalRelation,
    handleSelectPredication: commands.handleSelectPredication,
    handleSetNumeral: commands.handleSetNumeral,
    handleSetContrastive: commands.handleSetContrastive,
    handleSelectDirectionSpecifier: commands.handleSelectDirectionSpecifier,
    handleSelectSentiment: commands.handleSelectSentiment,
    handleToggleCollapse,
    handleRemoveComplement,
    satelliteKeys,
    determinerMenuFor,
    onDeterminerMenu: openDeterminerMenu,
    complementMenuOpen,
    onComplementMenu: setComplementMenuOpen,
    toolbarFor,
    onArmToolbar: setToolbarFor,
    removeRing:
      ringHost && onRemove
        ? {
            title: t(
              ringHost.kind === "owner"
                ? "action.removePossessor"
                : ringHost.kind === "standard"
                  ? "action.removeStandard"
                  : "action.removeConjunct",
            ),
            onRemove,
          }
        : undefined,
    // How the noun boxes take part in cross-container links and coref picks (see linkPickHandlers).
    ...linkPickHandlers({ coref, linkBinding, nounAddress }),
    consoleMark,
    onHoverSlot,
  };

  const canvas = (
    <PhraseCanvas
      ctx={ctx}
      showCanvas={showCanvas}
      canvasHeight={canvasHeight}
      graphSize={graphSize}
      edges={edges}
      groupEdges={[...groupEdges, ...linkEdges, ...possession.edges, ...standardEdges]}
      controlPos={controlPos}
      clearControls={clearControls}
      perimeterByNoun={perimeterByNoun}
      linkBinding={linkBinding}
      onSetImperativePerson={commands.handleSetImperativePerson}
      onSetImperativeRegister={commands.handleSetImperativeRegister}
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
              onCycleConjunction={commands.handleCycleConjunction}
              hostFor={conjunctHost}
              links={links}
              binding={binding}
              possessorPath={possessorPath}
              Builder={PhraseBuilder}
            />
          )}
          {(owners.length > 0 || possession.pointerLines.length > 0) && (
            <OwnerRings
              owners={owners}
              pointers={possession.pointerLines}
              selection={selection}
              onPhraseUpdate={onPhraseUpdate}
              onRemoveOwner={handleRemoveOwner}
              hostFor={ownerHost}
              binding={binding}
              Builder={PhraseBuilder}
            />
          )}
          {standard && (
            // The standard of comparison is an owner-shaped phrase: the same lens, another host.
            <OwnerRings
              owners={[standard]}
              pointers={[]}
              selection={selection}
              onPhraseUpdate={onPhraseUpdate}
              onRemoveOwner={handleRemoveStandard}
              hostFor={() => standardHost(standard)}
              binding={binding}
              Builder={PhraseBuilder}
            />
          )}
        </>
      }
    />
  );

  // A hosted ring's builder paints its ring onto the period's canvas. It wears no card of its own. A
  // standard whose degree takes none is drawn faded, words and controls alike, and stays usable.
  if (ringHost)
    return (
      <BoxScopeProvider scope={boxScope}>
        {ringHost.dimmed ? (
          <Box data-testid="standard-dimmed" sx={{ opacity: 0.45 }}>
            {canvas}
          </Box>
        ) : (
          canvas
        )}
      </BoxScopeProvider>
    );

  const tree = (
    <PeriodCard
      selection={selection}
      binding={binding}
      preview={Boolean(markedContainer && marks?.previewPeriods.has(markedContainer))}
      consoleNumber={markedContainer ? marks?.numbers.get(periodMark(markedContainer)) : undefined}
      compact={compact}
      showCanvas={showCanvas}
      hasGroups={groupRects.length > 0}
      hasContent={hasContent}
      soleContainer={soleContainer}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      onSave={onSave}
      onAddPeriod={onAddPeriod}
      onLoadPeriod={onLoadPeriod}
      onRemove={onRemove}
      onToggleCompact={handleToggleCompact}
      onTidy={handleTidyPeriod}
      onToggleImperative={handleToggleImperative}
      onToggleInfinitive={handleToggleInfinitive}
      onToggleQuestion={handleToggleQuestion}
      controlsRef={periodControlsRef}
      graphHeight={graphHeight}
      onGraphHeightChange={setGraphHeight}
      sidebar={
        // The words panel is the page's, opened from its header. Only a period wears a card, so only
        // the outermost builder has one.
        <PhraseSidebar
          open={wordsPanelOpen}
          onClose={() => onWordsPanelClose?.()}
          width={sidebarWidth}
          onWidthChange={setSidebarWidth}
          selection={selection}
          activeSlot={activeSlot}
          activeSlotConfig={activeSlotConfig}
          visibleSlots={visibleSlots}
          onSlotClick={selectSlot}
          onConceptSelect={handleConceptSelect}
        />
      }
    >
      {canvas}
    </PeriodCard>
  );

  // The outermost period builder provides the coref-pick coordinator to its whole subtree; a
  // nested builder inherited `parentCoref` and re-provides nothing. The keyboard scope is every
  // builder's own: a hosted ring's boxes answer to the builder that draws them, not to the
  // period's, so the nearest one down the tree wins.
  return (
    <BoxScopeProvider scope={boxScope}>
      {parentCoref ? (
        tree
      ) : (
        <CorefPickContext.Provider value={ownCoref}>{tree}</CorefPickContext.Provider>
      )}
    </BoxScopeProvider>
  );
}
