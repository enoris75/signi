import React, { useLayoutEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  type Concept,
  type CauseSentiment,
  type ComplementType,
  type PathSpecifier,
} from "@signi/shared";
import {
  adaptPossessorBinding,
  ConceptSelectOpts,
  GenderSlot,
  ImperativePerson,
  NounAddress,
  NounKey,
  NumberSlot,
  PhraseSelection,
  possessorAddress,
  slotCategories,
  SlotKey,
  WorkspaceBinding,
} from "./interfaces.ts";
import {
  ALL_SLOTS,
  COLLAPSIBLE_GROUPS,
  NOUN_KEYS,
  SATELLITE_SLOT_KEYS,
  getActiveSlots,
  isModalSlot,
  DEFAULT_POSITIONS,
  GRAPH_HEIGHT,
  MIN_GRAPH_HEIGHT,
  MUI_COLOR_HEX,
} from "./slots.ts";
import {
  applyConceptSelect,
  applyClear,
  cycleAspect,
  cycleDefiniteness,
  cycleDegree,
  cycleModifierRelation,
  cycleTense,
  removePossessor,
  setImperativePerson,
  setSentiment,
  setSpecifier,
  toggleGender,
  toggleImperative,
  toggleNegative,
  toggleNumber,
} from "./phraseReducers.ts";
import {
  buildSatelliteIcons,
  buildSatellites,
  type Satellite,
} from "./satellites.tsx";
import {
  computeCompactLayout,
  packPeriod,
  rearrangeGroupPositions,
  rescaleYForHeight,
} from "./layout.ts";
import {
  sameBoxSizes,
  sameRelConnectors,
  type RelConnector,
} from "./measure.ts";
import {
  buildGraph,
  rawGroupRect,
  DEFAULT_NODE_SIZE,
  type GroupRect,
  type GroupShape,
} from "./graph.ts";
import {
  resolveGroupOverlaps,
  BOTTOM_MARGIN,
  RANK_DRAGGED,
  RANK_FREE,
  RANK_GROWN,
} from "./overlap.ts";
import { type PhraseRenderContext } from "./phraseRender.tsx";
import { PhraseCanvas } from "./PhraseCanvas.tsx";
import { PhraseSidebar } from "./PhraseSidebar.tsx";
import { Resizer } from "./Resizer.tsx";
import { computeControlPositions } from "./controlLayout.ts";
import { openPossessorsFor, PossessorPanels } from "./PossessorPanels.tsx";
import { PeriodContainer, periodControls } from "./PeriodContainer.tsx";
import { RelativePhraseConnectors } from "./RelativePhraseConnectors.tsx";
import { useDrag } from "./useDrag.ts";

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
}: PhraseBuilderProps) {
  // When this builder edits a possessor (a `possessorPath` naming its head), wrap the
  // container's `binding` so the sub-builder can link like any container: its internal head
  // key `"subject"` is mapped onto the possessor address, and it is never itself a link
  // *target* (a possessor head can only *source* a relative clause today). Top-level
  // containers use their `binding` unchanged.
  const linkBinding: WorkspaceBinding | undefined =
    binding && possessorPath
      ? adaptPossessorBinding(binding, possessorPath)
      : binding;
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
  // Compact view: collapse every dotted box down to just its core word at once — a
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
  // or, verbless, for a lone noun phrase (the possessor editor). Before that, the empty
  // state offers the single opening word picker.
  const showCanvas = hasSubject || hasVerb;
  const visibleSlots = getActiveSlots(
    selection.verb?.transitivity,
    selection.subject?.role,
    Boolean(selection.subjectAdjective),
    selection.verb?.complements,
  )
    // Objects hang off the verb, so a subject-only (verbless) period shows none —
    // otherwise an empty Direct Object box would appear before any verb is chosen.
    .filter(
      (s) =>
        hasVerb ||
        !(
          s.key.startsWith("directObject") || s.key.startsWith("indirectObject")
        ),
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
      const subjectEmpty = !selection.subject;
      setActiveSlot(
        subjectEmpty
          ? "subject"
          : (slots.find(
              (s) =>
                s.key !== "verb" &&
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
  // its dotted box (un-reveal so it doesn't linger as an empty group).
  function handleRemoveComplement(type: ComplementType) {
    handleClear(type);
    setRevealed((prev) => ({ ...prev, [type]: false }));
    if (activeSlot === type) setActiveSlot("verb");
  }

  // Relative clauses are now cross-container links (see PhraseWorkspace): a noun's
  // "relative clause" satellite starts/removes a link via `binding`, and the target
  // container is folded in at serialization time — no in-selection relative slice.

  // Remove a noun block's possessor entirely and collapse its reveal.
  function handleRemovePossessor(which: NounKey) {
    onPhraseUpdate((prev) => removePossessor(prev, which));
    setRevealed((prev) => ({ ...prev, [`${which}Possessor`]: false }));
    // Drop any relative-clause link sourced from the possessor head that just vanished.
    binding?.relative.onRemoveLink(possessorAddress(possessorPath ?? which));
  }

  // Each grammatical control on the canvas is a pure selection transform (phraseReducers);
  // these bind them to this builder's slice.
  const handleToggleNumber = (which: NumberSlot) =>
    onPhraseUpdate((prev) => toggleNumber(prev, which));
  const handleToggleGender = (which: GenderSlot) =>
    onPhraseUpdate((prev) => toggleGender(prev, which));
  const handleToggleNegative = () => onPhraseUpdate(toggleNegative);
  const handleCycleDefiniteness = (which: NounKey) =>
    onPhraseUpdate((prev) => cycleDefiniteness(prev, which));
  const handleCycleModifierRelation = (slotKey: SlotKey) =>
    onPhraseUpdate((prev) => cycleModifierRelation(prev, slotKey));
  const handleCycleDegree = (slotKey: SlotKey) =>
    onPhraseUpdate((prev) => cycleDegree(prev, slotKey));
  const handleCycleTense = () => onPhraseUpdate(cycleTense);
  const handleCycleAspect = () => onPhraseUpdate(cycleAspect);
  const handleToggleImperative = () => onPhraseUpdate(toggleImperative);
  const handleSetImperativePerson = (person: ImperativePerson) =>
    onPhraseUpdate((prev) => setImperativePerson(prev, person));
  const handleSelectSpecifier = (spec: PathSpecifier) =>
    onPhraseUpdate((prev) => setSpecifier(prev, spec));
  const handleSelectSentiment = (sentiment: CauseSentiment) =>
    onPhraseUpdate((prev) => setSentiment(prev, sentiment));

  const { satellites, shownMap: rawShownMap } = buildSatellites(
    selection,
    revealed,
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

  // Re-arrange a single dotted box in place — compacting its child nodes around the
  // group's own current center. The tidied cluster is laid out from the nodes' real
  // footprints, so it can come back taller than the canvas (a box of long words, or one
  // wearing all three rows); when it does, the container grows to hold it rather than the
  // cluster being squashed back into a canvas that was never sized for it.
  function handleRearrangeGroup(group: GroupShape) {
    if (group.nodeKeys.length === 0) return;
    const { positions: tidied, minHeight } = rearrangeGroupPositions(
      group,
      (k) => positions[k] ?? DEFAULT_POSITIONS[k] ?? { x: 50, y: 50 },
      { w: svgSize.w, h: graphHeight },
      sizeOf,
    );
    setPositions((prev) => ({ ...prev, ...tidied }));
    // Growing rebases every y onto the new height (see rescaleYForHeight), so the cluster
    // we just placed keeps the pixel position it was laid out at.
    if (minHeight > graphHeight) setGraphHeight(minHeight);
  }

  function handleToggleReveal(sat: Satellite) {
    const willShow = !sat.shown;
    setRevealed((prev) => ({ ...prev, [sat.key]: willShow }));
    if (willShow && SATELLITE_SLOT_KEYS.has(sat.key as SlotKey)) {
      setActiveSlot(sat.key as SlotKey);
    }
  }

  // Sort every satellite's control into: its parent word box's border, the verb-phrase
  // dotted box (complement toggles), or a noun's dotted-box perimeter (relative-clause +
  // possessor controls, which also anchor their connector lines).
  const { satelliteIconsByParent, complementToggleIcons, perimeterByNoun } =
    buildSatelliteIcons({
      satellites,
      shownMap,
      collapsedMainKeys,
      linkBinding,
      onToggleNumber: handleToggleNumber,
      onToggleGender: handleToggleGender,
      onToggleNegative: handleToggleNegative,
      onToggleReveal: handleToggleReveal,
    });

  // Satellite slots (adjective / adverb) only render when revealed or filled.
  const renderedSlots = visibleSlots.filter(
    (s) => !SATELLITE_SLOT_KEYS.has(s.key) || shownMap[s.key],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  // The outermost positioned Box — connectors from a noun to its relative-clause
  // panel are measured relative to this, since the panels live below the canvas.
  const rootRef = useRef<HTMLDivElement>(null);
  // The possessor connector runs dot-to-dot: from the possessor control on the noun's
  // dotted-box perimeter (start) to the receiving dot on the panel's top edge (end).
  const possessorControlEls = useRef<Map<string, HTMLElement>>(new Map());
  const possessorDotEls = useRef<Map<string, HTMLElement>>(new Map());
  const [relConnectors, setRelConnectors] = useState<RelConnector[]>([]);
  const slotEls = useRef<Map<string, HTMLElement>>(new Map());
  // Measured pixel sizes of each core word box, keyed by slot key. Needed to place
  // each satellite reveal control on the box border facing its satellite (and to
  // start that satellite's connector from there).
  const [boxSizes, setBoxSizes] = useState<
    Record<string, { w: number; h: number }>
  >({});
  // A node's box as of the last paint. Everything that reasons about a node's footprint —
  // the dotted box that wraps it, the overlap resolver, the tidy layout — reads it through
  // here, so the three agree on where a box's edges are. A node not yet measured reads as
  // the nominal box the paddings already leave room for.
  const sizeOf = (key: string) => boxSizes[key] ?? DEFAULT_NODE_SIZE;
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >(() => ({ ...DEFAULT_POSITIONS }));
  const { dragRef, draggingKey, makeDragProps, makeGroupDragProps } = useDrag({
    positions,
    setPositions,
    containerRef,
  });
  const [svgSize, setSvgSize] = useState<{ w: number; h: number }>({
    w: 600,
    h: GRAPH_HEIGHT,
  });
  const [graphHeight, setGraphHeight] = useState<number>(() => {
    const saved = localStorage.getItem("signi:graphHeight");
    return saved ? Math.max(MIN_GRAPH_HEIGHT, Number(saved)) : GRAPH_HEIGHT;
  });

  // Resizing the container must not move the content vertically. Node y's are % of the
  // canvas, so a height change alone would slide them all; rebase them onto the new height
  // to hold each node's pixel offset from the canvas top. Runs before paint, so the nodes
  // never render at the un-rebased position — the resized edge just yields empty space.
  const prevGraphHeightRef = useRef(graphHeight);
  // Set for the one commit that sees a new height but the positions the old one was laid
  // out against — the rebase below only lands on the render after. Any footprint measured
  // in between reads too tall, so whoever measures them sits that commit out.
  const positionsStaleRef = useRef(false);
  useLayoutEffect(() => {
    const prevH = prevGraphHeightRef.current;
    if (prevH === graphHeight) return;
    prevGraphHeightRef.current = graphHeight;
    positionsStaleRef.current = true;
    setPositions((prev) => rescaleYForHeight(prev, prevH, graphHeight));
    // A drag in flight holds the grabbed nodes' start y's in the old height's % too — and
    // the canvas can grow mid-drag, when a box shoved aside has to go down instead. Rebase
    // them with everything else, or the box under the pointer jumps on the next move.
    const drag = dragRef.current;
    if (drag)
      drag.origPositions = rescaleYForHeight(
        drag.origPositions,
        prevH,
        graphHeight,
      );
  }, [graphHeight]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setSvgSize({ w: width, h: height });
    const obs = new ResizeObserver((entries) => {
      const { width: w, height: h } = entries[0].contentRect;
      setSvgSize({ w, h });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [showCanvas]);

  // After every render, measure each core word box's pixel size. Control icons and
  // their connectors are placed on the box border, so we need the box's half-extents.
  // Runs on every commit; settles because it only sets state on an actual size change.
  useLayoutEffect(() => {
    const next: Record<string, { w: number; h: number }> = {};
    for (const [key, el] of slotEls.current) {
      const r = el.getBoundingClientRect();
      next[key] = { w: r.width, h: r.height };
    }
    setBoxSizes((prev) => (sameBoxSizes(prev, next) ? prev : next));
  });

  // After every render, measure each open possessor's connector dot-to-dot: from the
  // possessor control on the noun's dotted-box perimeter (start) to the receiving dot
  // on the panel's top edge (end). Both are measured relative to the root Box so the
  // SVG overlay can span the gap down to the docked panel. Guarded so it settles; runs
  // every commit, so it tracks a noun box dragged around the canvas.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const next: RelConnector[] = [];
    // Measure one control→panel-dot connector. `prefix` keeps keys distinct so a noun
    // could carry several such connectors without their ids colliding.
    const measure = (
      which: string,
      controlEl: HTMLElement | undefined,
      dotEl: HTMLElement | undefined,
      prefix: string,
    ) => {
      // Skip the connector while the noun's group box is collapsed.
      const label = COLLAPSIBLE_GROUPS.find((g) => g.mainKey === which)?.label;
      if (label && effectiveCollapsed[label]) return;
      if (!controlEl || !dotEl) return;
      const c = controlEl.getBoundingClientRect();
      const d = dotEl.getBoundingClientRect();
      const x1 = c.left + c.width / 2 - rootRect.left;
      const y1 = c.top + c.height / 2 - rootRect.top;
      const x2 = d.left + d.width / 2 - rootRect.left;
      const y2 = d.top + d.height / 2 - rootRect.top;
      const color =
        MUI_COLOR_HEX[
          ALL_SLOTS.find((s) => s.key === which)?.color ?? "primary"
        ];
      next.push({ which: `${prefix}:${which}`, x1, y1, x2, y2, color });
    };
    for (const which of openPossessors)
      measure(
        which,
        possessorControlEls.current.get(which),
        possessorDotEls.current.get(which),
        "poss",
      );
    setRelConnectors((prev) => (sameRelConnectors(prev, next) ? prev : next));
  });

  // Tell the workspace to re-measure its cross-container link lines whenever this
  // container's canvas geometry changes — a box dragged, the canvas resized, a group
  // collapsed. The workspace can't observe our internal drag state, so it would
  // otherwise draw stale subordinate connectors. Keyed on the geometry-bearing state
  // only, so a workspace re-render (new binding object) doesn't refire it into a loop.
  const notifyGeometry = binding?.geometry.onGeometryChange;
  useLayoutEffect(() => {
    notifyGeometry?.();
  }, [
    notifyGeometry,
    positions,
    boxSizes,
    svgSize,
    graphHeight,
    collapsedGroups,
    compact,
  ]);

  // Compact-view layout, derived (not stored) each render: pack the visible core words
  // into centered rows and size the canvas to just wrap them. Because it's recomputed
  // from the current width every render, it never goes stale on a resize, and the stored
  // full-view positions/height stay pristine for when compact turns back off. The core
  // words are exactly `renderedSlots` in compact (satellites are already filtered out).
  const compactLayout = React.useMemo(
    () =>
      compact
        ? computeCompactLayout(
            renderedSlots.map((s) => s.key),
            svgSize.w,
          )
        : null,
    [compact, renderedSlots, svgSize.w],
  );

  // Canvas height + the size buildGraph measures against: the tight compact height when
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

  function pos(key: string) {
    if (compactLayout?.positions[key]) return compactLayout.positions[key];
    return positions[key] ?? DEFAULT_POSITIONS[key];
  }

  // Canvas-pixel position of each satellite reveal control, keyed by satellite
  // key; also fed to buildGraph as each link's origin (see controlLayout).
  const controlPos = computeControlPositions({
    satelliteIconsByParent,
    boxSizes,
    pos,
    svgSize: graphSize,
  });

  const { edges, groupRects, groupEdges } = buildGraph({
    drawCanvas: showCanvas,
    // The possessor's own head is a box on this canvas; in a relative clause the
    // subject is the external head, so it isn't drawn.
    showSubject: true,
    compact,
    renderedSlots,
    visibleSlots,
    shownMap,
    pos,
    controlPos,
    sizeOf,
    svgSize: graphSize,
  });

  // Dotted boxes never overlap. A box's footprint is derived from the nodes inside it, so
  // revealing a satellite, adding an adjective, expanding a group or dragging a node out
  // all grow it — potentially straight over a neighbour. After every commit, measure the
  // boxes and slide the ones that would be covered aside or down until each is clear.
  //
  // The box that caused the growth holds its ground and everything else yields to it: the
  // box under the pointer outranks all, then any box that just grew or just appeared. The
  // last footprint of each box is remembered so "just grew" can be read off the difference.
  // Nothing to compare against on the first pass (`null`), so nothing is pinned and any
  // boxes that start out overlapping share the shove evenly.
  //
  // Compact view packs its own non-overlapping rows and derives positions rather than
  // storing them, so there is nothing here to resolve or to write back.
  const prevGroupSizesRef = useRef<Map<
    string,
    { w: number; h: number }
  > | null>(null);
  useLayoutEffect(() => {
    if (compact || groupRects.length === 0) return;
    // The rebase that follows a height change re-renders, so nothing is lost by waiting
    // for it — and measuring before it would size the canvas from stretched footprints,
    // which feeds its own next measurement and ratchets the canvas taller without end.
    if (positionsStaleRef.current) {
      positionsStaleRef.current = false;
      return;
    }
    const sizes = new Map(
      groupRects.map((g) => {
        const r = rawGroupRect(g, pos, graphSize, false, sizeOf);
        return [g.label, { w: r.width, h: r.height }] as const;
      }),
    );
    const before = prevGroupSizesRef.current;
    prevGroupSizesRef.current = sizes;

    const dragKeys = dragRef.current?.keys;
    const rankOf = (g: GroupRect) => {
      if (dragKeys?.some((k) => g.nodeKeys.includes(k))) return RANK_DRAGGED;
      if (!before) return RANK_FREE;
      const was = before.get(g.label);
      const now = sizes.get(g.label)!;
      const grew = !was || now.w > was.w + 0.5 || now.h > was.h + 0.5;
      return grew ? RANK_GROWN : RANK_FREE;
    };

    const separated =
      groupRects.length < 2
        ? null
        : resolveGroupOverlaps({
            groupRects,
            pos,
            sizeOf,
            svgSize: graphSize,
            rankOf,
          });
    // Null once the boxes are clear of each other — which is the common case, and what
    // lets this run on every commit without chasing its own writes.
    if (separated) setPositions((prev) => ({ ...prev, ...separated.positions }));

    // Only once the pointer has travelled: a press that turns out to be a click on a slot
    // must not resize anything under the user's finger.
    if (dragRef.current?.moved) {
      // A drag in flight sizes the canvas to its content: it grows so a box dragged
      // toward the bottom edge stays whole rather than being clipped by it, and shrinks
      // back so pulling that box up again doesn't strand a band of dead space beneath the
      // boxes. Measured against the positions the separation just wrote, or this would
      // fit the canvas to where the boxes were before they were shoved clear.
      const settled = (key: string) => separated?.positions[key] ?? pos(key);
      const bottom = Math.max(
        ...groupRects.map((g) => {
          const r = rawGroupRect(g, settled, graphSize, false, sizeOf);
          return r.y + r.height;
        }),
      );
      const fitted = Math.max(
        MIN_GRAPH_HEIGHT,
        Math.ceil(bottom + BOTTOM_MARGIN),
      );
      // The height rebase (above) holds every node's pixel offset, so the room only ever
      // appears or disappears at the bottom and nothing else shifts. Not persisted: this
      // is the content claiming space, not the user sizing the container with the grip.
      if (fitted !== graphHeight) setGraphHeight(fitted);
      return;
    }
    // Outside a drag the canvas only ever grows, and only to meet a box the separation
    // pushed down past the bottom edge. Shrinking here would fight the resize grip, whose
    // whole purpose is to hold a height the content didn't ask for.
    if (separated && separated.minHeight > graphHeight)
      setGraphHeight(separated.minHeight);
  });

  // Tidy the whole period: tidy each dotted box on its own — the same re-arrange its own
  // button runs — then pack the tidied boxes into non-overlapping rows in reading order:
  // subject · verb phrase · direct object · indirect object · complements. Collapse state
  // is left alone; one click re-flows the container into a clean grid without hiding
  // anything the user had revealed.
  function handleTidyPeriod() {
    if (groupRects.length === 0) return;
    const { positions: packed, minHeight } = packPeriod(
      groupRects,
      graphSize,
      sizeOf,
    );
    setPositions((prev) => ({ ...prev, ...packed }));
    // Expanded boxes can need more room than the canvas has; grow it rather than pack them
    // off the bottom edge. The rebase onto the new height (rescaleYForHeight) holds every
    // pixel offset, so the grid we just laid out stays put.
    if (minHeight > graphHeight) setGraphHeight(minHeight);
  }

  // Compact / expand the whole period. This is a pure view toggle: the compact packing
  // and shrunk canvas height are *derived* each render (see compactLayout below), so the
  // stored full-view positions and graphHeight are left untouched — expanding just falls
  // straight back to them, and the compact layout can never go stale on a resize.
  function handleToggleCompact() {
    setCompact((c) => !c);
  }

  const openPossessors = openPossessorsFor(selection, shownMap);

  // Shared bag passed to the verb/noun phrase builders — they all paint onto the
  // same canvas below and lean on this component's drag machinery and handlers.
  const ctx: PhraseRenderContext = {
    selection,
    activeSlot,
    renderedSlots,
    shownMap,
    satelliteIconsByParent,
    complementToggleIcons,
    groupRects,
    collapsedGroups: effectiveCollapsed,
    compact,
    draggingKey,
    makeDragProps,
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
    handleCycleDefiniteness,
    handleCycleModifierRelation,
    handleCycleDegree,
    handleToggleNegative,
    handleCycleTense,
    handleCycleAspect,
    handleSelectSpecifier,
    handleSelectSentiment,
    handleToggleCollapse,
    handleRearrangeGroup,
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
    isPickTarget: linkBinding
      ? (key) =>
          NOUN_KEYS.includes(key as NounKey) &&
          linkBinding.relative.isPickTarget(key as NounKey)
      : undefined,
    onPickTarget: linkBinding
      ? (key) => linkBinding.relative.onPick(key as NounKey)
      : undefined,
  };

  // The clause-level connector controls on the card border, derived from the workspace binding
  // (undefined for a standalone period). See periodControls in PeriodContainer.tsx.
  const clauseControls = periodControls(binding, selection);

  // The card's contents — the canvas, its resize grip, and any docked possessor panels.
  // Shared by both chromes below: a top-level period wears the PeriodContainer card
  // or possessor the plainer Paper drawn inline.
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
        perimeterByNoun={perimeterByNoun}
        linkBinding={linkBinding}
        onSetImperativePerson={handleSetImperativePerson}
        containerRef={containerRef}
        possessorControlEls={possessorControlEls}
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
          Builder={PhraseBuilder}
        />
      )}
    </>
  );

  return (
    <Box
      ref={rootRef}
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
        // A workspace container stays in the managed stack so the cross-container
        // connectors measure correctly; only a standalone period may be floated.
        floatable={!binding}
        position={position}
        onPositionChange={setPosition}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onSave={onSave}
        onRemove={onRemove}
        onToggleCompact={handleToggleCompact}
        onTidy={handleTidyPeriod}
        conditional={clauseControls.conditional}
        coordinative={clauseControls.coordinative}
        imperative={{
          active: Boolean(selection.imperative),
          // An imperative is a mood, mutually exclusive with a conditional / coordination, so the
          // toggle is disabled while this period takes part in one.
          disabled: binding
            ? binding.conditional.hasSource ||
              binding.conditional.hasTarget ||
              binding.coordinative.hasSource ||
              binding.coordinative.hasTarget
            : false,
          onToggle: handleToggleImperative,
        }}
      >
        {content}
      </PeriodContainer>

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
    </Box>
  );
}
