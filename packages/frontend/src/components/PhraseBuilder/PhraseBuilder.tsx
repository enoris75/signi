import React, { useLayoutEffect, useRef, useState } from "react";
import { alpha, Box, Paper, Typography, IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  COMPLEMENT_TYPES,
  type Concept,
  type CauseSentiment,
  type ComplementType,
  type PathSpecifier,
} from "@signi/shared";
import { VerbTypeahead } from "./VerbTypeahead.tsx";
import { SubjectTypeahead } from "./SubjectTypeahead.tsx";
import { SlotBox } from "./Boxes.tsx";
import {
  adaptPossessorBinding,
  ConceptSelectOpts,
  GenderSlot,
  NounAddress,
  NounKey,
  NumberSlot,
  PhraseSelection,
  possessorAddress,
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
  setSentiment,
  setSpecifier,
  toggleGender,
  toggleNegative,
  toggleNumber,
} from "./phraseReducers.ts";
import {
  buildSatelliteIcons,
  buildSatellites,
  conceptLabel,
  type Satellite,
} from "./satellites.tsx";
import {
  computeCompactLayout,
  packPeriod,
  rearrangeGroupPositions,
  rescaleYForHeight,
} from "./layout.ts";
import { sameBoxSizes, sameRelConnectors, type RelConnector } from "./measure.ts";
import { buildGraph, rawGroupRect, type GroupRect } from "./graph.ts";
import {
  resolveGroupOverlaps,
  RANK_DRAGGED,
  RANK_FREE,
  RANK_GROWN,
} from "./overlap.ts";
import { type PhraseRenderContext } from "./phraseRender.tsx";
import { NounPhraseBuilder } from "./NounPhraseBuilder.tsx";
import { VerbPhraseBuilder } from "./VerbPhraseBuilder.tsx";
import { ConnectorsLayer } from "./ConnectorsLayer.tsx";
import { PhraseSidebar } from "./PhraseSidebar.tsx";
import { Resizer } from "./Resizer.tsx";
import { SatelliteControls } from "./SatelliteControls.tsx";
import { GroupPerimeterControls } from "./GroupPerimeterControls.tsx";
import { computeControlPositions } from "./controlLayout.ts";
import { openPossessorsFor, PossessorPanels } from "./PossessorPanels.tsx";

export interface PhraseBuilderProps {
  selection: PhraseSelection;
  onPhraseUpdate: (updater: (prev: PhraseSelection) => PhraseSelection) => void;
  // Clause mode: this builder edits a relative clause whose subject is the external
  // `head` noun rather than a box on its own canvas. Set for every nested instance.
  nested?: boolean;
  // Noun-phrase mode: this builder edits a bare noun phrase (the possessor) — its head
  // lives in the `subject` slot and there is no verb/predicate. A noun phrase is not a
  // period, so it renders as a dashed box inside its owner rather than as its own card.
  nounPhrase?: boolean;
  // Noun-phrase mode: the hex colour of the owning noun, used for the dashed outline so
  // the box matches the role group and the connector that runs down into it.
  dottedColor?: string;
  head?: Concept;
  // Whether the head reads as animate ("who") vs inanimate ("that"), for the label.
  relativeLabel?: string;
  onRemove?: () => void;
  // Top-level only: this is the sole period in the workspace, so it can't be deleted — the
  // header's `onRemove` control clears its content in place instead of removing the container.
  soleContainer?: boolean;
  // Top-level only: move this period one place up/down the workspace stack. Left undefined
  // at the ends of the stack, where the header shows the control disabled.
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  // Top-level only: save just this clause (a "period") to the saved-phrase store. Shown as
  // a small icon in the main-clause header. Undefined for nested (possessor/relative) builders.
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

type DragState = {
  keys: string[];
  startX: number;
  startY: number;
  origPositions: Record<string, { x: number; y: number }>;
  moved: boolean;
};

export function PhraseBuilder({
  selection,
  onPhraseUpdate,
  nested = false,
  nounPhrase = false,
  dottedColor,
  head,
  relativeLabel,
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
  // Only a nested relative clause starts on the verb, since its subject is the external head.
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(
    nested ? "verb" : "subject",
  );
  // A filled word box the user clicked to change its word: its inline picker is shown
  // over the current word. Null when no box is being re-picked. Cleared on select or blur.
  const [editingSlot, setEditingSlot] = useState<SlotKey | null>(null);
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
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const borderDragRef = useRef<{
    startX: number;
    startY: number;
    startPos: { x: number; y: number };
  } | null>(null);
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
  const showCanvas = hasSubject || hasVerb || nounPhrase;
  const verbSlot = ALL_SLOTS.find((s) => s.key === "verb")!;
  const subjectSlot = ALL_SLOTS.find((s) => s.key === "subject")!;
  const visibleSlots = nounPhrase
    ? // Noun-phrase mode: only the subject family (the possessor head + its adjectives).
      getActiveSlots("intransitive", selection.subject?.role, Boolean(selection.subjectAdjective))
        .filter((s) => s.key === "subject" || s.key.startsWith("subjectAdjective"))
    : getActiveSlots(
        selection.verb?.transitivity,
        selection.subject?.role,
        Boolean(selection.subjectAdjective),
        selection.verb?.complements,
        // In clause mode the subject is the external head, so drop the subject slot.
      )
        .filter((s) => !nested || s.key !== "subject")
        // Objects hang off the verb, so a subject-only (verbless) period shows none —
        // otherwise an empty Direct Object box would appear before any verb is chosen.
        .filter(
          (s) =>
            hasVerb ||
            !(s.key.startsWith("directObject") || s.key.startsWith("indirectObject")),
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
    binding?.onRemoveLink(possessorAddress(possessorPath ?? which));
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
  // group's own current center.
  function handleRearrangeGroup(nodeKeys: string[]) {
    if (nodeKeys.length === 0) return;
    setPositions((prev) => ({
      ...prev,
      ...rearrangeGroupPositions(nodeKeys, prev, svgSize),
    }));
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
  const slotEls = useRef<Map<SlotKey, HTMLElement>>(new Map());
  // Measured pixel sizes of each core word box, keyed by slot key. Needed to place
  // each satellite reveal control on the box border facing its satellite (and to
  // start that satellite's connector from there).
  const [boxSizes, setBoxSizes] = useState<
    Record<string, { w: number; h: number }>
  >({});
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >(() => ({ ...DEFAULT_POSITIONS }));
  const dragRef = useRef<DragState | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [svgSize, setSvgSize] = useState<{ w: number; h: number }>({
    w: 600,
    h: GRAPH_HEIGHT,
  });
  const [graphHeight, setGraphHeight] = useState<number>(() => {
    // Nested clause / possessor canvases start shorter and don't persist (the global
    // key is shared, so many instances would clobber each other).
    if (nested || nounPhrase) return MIN_GRAPH_HEIGHT + 60;
    const saved = localStorage.getItem("signi:graphHeight");
    return saved ? Math.max(MIN_GRAPH_HEIGHT, Number(saved)) : GRAPH_HEIGHT;
  });

  // Resizing the container must not move the content vertically. Node y's are % of the
  // canvas, so a height change alone would slide them all; rebase them onto the new height
  // to hold each node's pixel offset from the canvas top. Runs before paint, so the nodes
  // never render at the un-rebased position — the resized edge just yields empty space.
  const prevGraphHeightRef = useRef(graphHeight);
  useLayoutEffect(() => {
    const prevH = prevGraphHeightRef.current;
    if (prevH === graphHeight) return;
    prevGraphHeightRef.current = graphHeight;
    setPositions((prev) => rescaleYForHeight(prev, prevH, graphHeight));
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
        MUI_COLOR_HEX[ALL_SLOTS.find((s) => s.key === which)?.color ?? "primary"];
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
  const notifyGeometry = binding?.onGeometryChange;
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

  function startDrag(e: React.PointerEvent, key: string) {
    const p = positions[key] ?? DEFAULT_POSITIONS[key];
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      keys: [key],
      startX: e.clientX,
      startY: e.clientY,
      origPositions: { [key]: { x: p.x, y: p.y } },
      moved: false,
    };
    setDraggingKey(key);
  }

  function moveDrag(e: React.PointerEvent) {
    if (!dragRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    if (
      Math.abs(e.clientX - dragRef.current.startX) > 6 ||
      Math.abs(e.clientY - dragRef.current.startY) > 6
    ) {
      dragRef.current.moved = true;
    }
    const { keys, origPositions } = dragRef.current;
    setPositions((prev) => {
      const next = { ...prev };
      for (const k of keys) {
        const orig = origPositions[k];
        next[k] = {
          x: Math.max(1, Math.min(99, orig.x + dx)),
          y: Math.max(1, Math.min(99, orig.y + dy)),
        };
      }
      return next;
    });
  }

  function startGroupDrag(e: React.PointerEvent, nodeKeys: string[]) {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const origPositions: Record<string, { x: number; y: number }> = {};
    for (const key of nodeKeys) {
      const p = positions[key] ?? DEFAULT_POSITIONS[key];
      origPositions[key] = { x: p.x, y: p.y };
    }
    dragRef.current = {
      keys: nodeKeys,
      startX: e.clientX,
      startY: e.clientY,
      origPositions,
      moved: false,
    };
    setDraggingKey("__group__");
  }

  function endDrag(onActivate?: () => void) {
    if (dragRef.current && !dragRef.current.moved) onActivate?.();
    dragRef.current = null;
    setDraggingKey(null);
  }

  function startBorderDrag(e: React.PointerEvent<HTMLDivElement>) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    borderDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: position ?? { x: 0, y: 0 },
    };
  }

  function moveBorderDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!borderDragRef.current) return;
    const dx = e.clientX - borderDragRef.current.startX;
    const dy = e.clientY - borderDragRef.current.startY;
    setPosition({
      x: borderDragRef.current.startPos.x + dx,
      y: borderDragRef.current.startPos.y + dy,
    });
  }

  function endBorderDrag() {
    borderDragRef.current = null;
  }

  function makeDragProps(key: string, onActivate: () => void) {
    const isDragging = draggingKey === key;
    const p = positions[key] ?? DEFAULT_POSITIONS[key];
    return {
      onPointerDown: (e: React.PointerEvent) => startDrag(e, key),
      onPointerMove: moveDrag,
      onPointerUp: () => endDrag(onActivate),
      onPointerCancel: () => endDrag(),
      sx: {
        position: "absolute" as const,
        left: `${p.x}%`,
        top: `${p.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isDragging ? 10 : 1,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        outline: "none",
      },
    };
  }

  // Pointer handlers for a dashed group box — dragging it moves every child node
  // together. The GroupBox owns its own positioning, so unlike makeDragProps this
  // returns handlers only.
  function makeGroupDragProps(nodeKeys: string[]) {
    return {
      onPointerDown: (e: React.PointerEvent) => startGroupDrag(e, nodeKeys),
      onPointerMove: moveDrag,
      onPointerUp: () => endDrag(),
      onPointerCancel: () => endDrag(),
    };
  }

  // Compact-view layout, derived (not stored) each render: pack the visible core words
  // into centered rows and size the canvas to just wrap them. Because it's recomputed
  // from the current width every render, it never goes stale on a resize, and the stored
  // full-view positions/height stay pristine for when compact turns back off. The core
  // words are exactly `renderedSlots` in compact (satellites are already filtered out).
  const compactLayout = React.useMemo(
    () =>
      compact
        ? computeCompactLayout(renderedSlots.map((s) => s.key), svgSize.w)
        : null,
    [compact, renderedSlots, svgSize.w],
  );

  // Canvas height + the size buildGraph measures against: the tight compact height when
  // compact, else the (resizable) full-view height. Both the group rects and the box %
  // positions are computed against this same height, so they stay consistent.
  const canvasHeight = compactLayout ? compactLayout.height : graphHeight;
  const graphSize = compactLayout ? { w: svgSize.w, h: canvasHeight } : svgSize;

  // The Paper's padding, in theme spacing units. The resize grip negates it to sit flush
  // with the container's bottom border, so the two must stay in step.
  const paperPad = nounPhrase ? 1.5 : compact ? 1 : 2;

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
    nounPhrase,
    // The possessor's own head is a box on this canvas; in a relative clause the
    // subject is the external head, so it isn't drawn.
    showSubject: nounPhrase ? true : !nested,
    compact,
    renderedSlots,
    visibleSlots,
    shownMap,
    pos,
    controlPos,
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
  const prevGroupSizesRef = useRef<Map<string, { w: number; h: number }> | null>(
    null,
  );
  useLayoutEffect(() => {
    if (compact || groupRects.length < 2) return;
    const sizes = new Map(
      groupRects.map((g) => {
        const r = rawGroupRect(g, pos, graphSize, false);
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

    const separated = resolveGroupOverlaps({
      groupRects,
      pos,
      svgSize: graphSize,
      rankOf,
    });
    // Null once the boxes are clear of each other — which is the common case, and what
    // lets this run on every commit without chasing its own writes.
    if (separated) setPositions((prev) => ({ ...prev, ...separated }));
  });

  // Tidy the whole period: collapse every dotted box down to its main word, then pack
  // the collapsed boxes into non-overlapping rows in reading order — subject · verb
  // phrase · direct object · indirect object · complements. One click re-flows the
  // whole container into a clean grid.
  function handleTidyPeriod() {
    if (groupRects.length === 0) return;
    const { labels, positions: packed } = packPeriod(groupRects, svgSize);
    // Collapse everything: every group label maps to a COLLAPSIBLE_GROUPS entry, so the
    // packed footprints are what actually renders.
    setCollapsedGroups(Object.fromEntries(labels.map((l) => [l, true])));
    setPositions((prev) => ({ ...prev, ...packed }));
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
    nounPhrase,
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
            linkBinding.registerBox(key as NounKey, el);
        }
      : undefined,
    dimmedKeys: linkBinding ? (linkBinding.linkTargetKeys as Set<string>) : undefined,
    isPickTarget: linkBinding
      ? (key) =>
          NOUN_KEYS.includes(key as NounKey) && linkBinding.isPickTarget(key as NounKey)
      : undefined,
    onPickTarget: linkBinding ? (key) => linkBinding.onNounPick(key as NounKey) : undefined,
  };

  return (
    <Box
      ref={rootRef}
      sx={{
        position: position ? "fixed" : "relative",
        ...(position && { left: `${position.x}px`, top: `${position.y}px` }),
        zIndex: position ? 50 : "auto",
      }}
    >
      {/* Connectors linking each noun to its relative-clause panel below the
          canvas. Painted over the whole builder so the line can bridge the gap
          between the canvas and the docked clause panels. */}
      {relConnectors.length > 0 && (
        <Box
          component="svg"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          {relConnectors.map((c) => (
            <line
              key={c.which}
              x1={c.x1}
              y1={c.y1}
              x2={c.x2}
              y2={c.y2}
              stroke={c.color}
              strokeWidth="1.5"
              strokeOpacity="0.4"
              strokeDasharray="5 3"
            />
          ))}
        </Box>
      )}
      <Paper
        elevation={0}
        onPointerDown={(e) => {
          // Nested panels stay docked, a possessor stays inside its owner's dashed box,
          // and workspace containers stay in the managed stack so cross-container
          // connectors measure correctly.
          if (nested || nounPhrase || binding) return;
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const borderWidth = 8;
          const isNearBorder =
            e.clientX - rect.left < borderWidth ||
            e.clientX - rect.left > rect.width - borderWidth ||
            e.clientY - rect.top < borderWidth ||
            e.clientY - rect.top > rect.height - borderWidth;
          if (isNearBorder) {
            startBorderDrag(e as React.PointerEvent<HTMLDivElement>);
          }
        }}
        onPointerMove={(e) => {
          if (borderDragRef.current) {
            moveBorderDrag(e as React.PointerEvent<HTMLDivElement>);
          }
        }}
        onPointerUp={endBorderDrag}
        onPointerCancel={endBorderDrag}
        sx={{
          p: paperPad,
          // Compact floats its controls into the top-right corner, so the Paper is the
          // positioning context for that overlay.
          position: "relative",
          // A possessor is only a noun phrase, not a period of its own, so it wears the
          // same dashed outline as the role groups on the canvas above it rather than the
          // period container's accent card. A clause or the main period keeps the card
          // (left rule + tinted bg), its rule's colour marking the kind.
          ...(nounPhrase
            ? {
                border: "1px dashed",
                borderColor: dottedColor
                  ? alpha(dottedColor, 0.5)
                  : "info.light",
                borderRadius: "4px",
                bgcolor: "transparent",
              }
            : {
                border: "1px solid",
                borderColor: "divider",
                borderLeft: "3px solid",
                borderLeftColor: nested ? "primary.light" : "text.secondary",
                bgcolor: "action.hover",
              }),
          cursor:
            borderDragRef.current && position
              ? "grabbing"
              : position
                ? "default"
                : undefined,
        }}
      >
        {nested || nounPhrase ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              {conceptLabel(head) ?? "…"}{" "}
              <Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
                · {relativeLabel ?? "that"} …
              </Box>
            </Typography>
            {onRemove && (
              <IconButton
                size="small"
                onClick={onRemove}
                aria-label={nounPhrase ? "Remove possessor" : "Remove relative clause"}
                sx={{ p: 0.25 }}
              >
                <CloseIcon sx={{ fontSize: 15 }} />
              </IconButton>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              // Compact drops the label and floats the controls into the top-right corner
              // (absolute), so they reserve no vertical space and the chips rise to the top
              // of the reclaimed area; full view keeps the labelled header in flow.
              ...(compact
                ? {
                    position: "absolute",
                    top: 6,
                    right: 6,
                    zIndex: 4,
                    m: 0,
                  }
                : { mb: 1.5 }),
            }}
          >
            {/* The "Main clause · …" caption is chrome the compact overview doesn't need. */}
            {!compact && (
            <Typography
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              Main clause{" "}
              <Box
                component="span"
                sx={{ color: "text.disabled", fontWeight: 500 }}
              >
                ·{" "}
                {showCanvas
                  ? "click a slot then choose a word"
                  : "start by choosing a subject"}
              </Box>
            </Typography>
            )}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* Reorder within the workspace stack. Both controls stay mounted while the
                  workspace holds more than one period, so the cluster doesn't shift width
                  as a period reaches an end; the one with nowhere to go is disabled. */}
              {!soleContainer && (
                <>
                  <Tooltip title="Move this period up">
                    <span>
                      <IconButton
                        size="small"
                        onClick={onMoveUp}
                        disabled={!onMoveUp}
                        aria-label="Move this period up"
                        sx={{ p: 0.25 }}
                      >
                        <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Move this period down">
                    <span>
                      <IconButton
                        size="small"
                        onClick={onMoveDown}
                        disabled={!onMoveDown}
                        aria-label="Move this period down"
                        sx={{ p: 0.25 }}
                      >
                        <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </>
              )}
              {groupRects.length > 0 && (
                <Tooltip
                  title={compact ? "Expand this period" : "Compact this period"}
                >
                  <IconButton
                    size="small"
                    onClick={handleToggleCompact}
                    aria-label={
                      compact ? "Expand this period" : "Compact this period"
                    }
                    color={compact ? "primary" : "default"}
                    sx={{ p: 0.25 }}
                  >
                    {compact ? (
                      <UnfoldMoreIcon sx={{ fontSize: 15 }} />
                    ) : (
                      <UnfoldLessIcon sx={{ fontSize: 15 }} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
              {groupRects.length > 0 && (
                <Tooltip title="Tidy up this period">
                  <IconButton
                    size="small"
                    onClick={handleTidyPeriod}
                    aria-label="Tidy up this period"
                    sx={{ p: 0.25 }}
                  >
                    <AutoFixHighIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              )}
              {onSave && (
                <Tooltip title="Save this period">
                  <span>
                    <IconButton
                      size="small"
                      onClick={onSave}
                      // Nothing to save until the clause has content.
                      disabled={!hasContent}
                      aria-label="Save this period"
                      sx={{ p: 0.25 }}
                    >
                      <SaveOutlinedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {/* The sole period can't be removed (the workspace always keeps one), so its
                  control clears the content in place. Hide it when there's nothing to clear;
                  a removable (non-sole) container keeps its remove control even when empty. */}
              {onRemove && (!soleContainer || hasContent) && (
                <Tooltip
                  title={soleContainer ? "Clear this period" : "Remove this period"}
                >
                  <IconButton
                    size="small"
                    onClick={() => {
                      // Confirm only when there's work to lose; an empty clause acts silently.
                      const message = soleContainer
                        ? "Clear this main clause and everything in it?"
                        : "Remove this main clause and everything in it?";
                      if (hasContent && !window.confirm(message)) return;
                      onRemove();
                    }}
                    aria-label={
                      soleContainer ? "Clear main clause" : "Remove main clause"
                    }
                    sx={{ p: 0.25 }}
                  >
                    {soleContainer ? (
                      <BackspaceOutlinedIcon sx={{ fontSize: 15 }} />
                    ) : (
                      <CloseIcon sx={{ fontSize: 15 }} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        )}

        <Box sx={{ minWidth: 0 }}>
          {!showCanvas ? (
              // An empty period is still the full, resizable canvas height — the bottom
              // edge resizes it just as it does once words land on the canvas.
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: canvasHeight,
                }}
              >
                {/* A period opens on its subject noun phrase; only a nested relative
                    clause opens on the verb (its subject is the external head). */}
                {nested ? (
                  <SlotBox
                    slot={verbSlot}
                    concept={undefined}
                    isActive={activeSlot === "verb"}
                    onClear={() => handleClear("verb")}
                    emptyContent={
                      <VerbTypeahead
                        onSelect={(c) => handleConceptSelect(c, "verb")}
                      />
                    }
                  />
                ) : (
                  <SlotBox
                    slot={subjectSlot}
                    concept={undefined}
                    isActive={activeSlot === "subject"}
                    onClear={() => handleClear("subject")}
                    emptyContent={
                      <SubjectTypeahead
                        onSelect={(c, opts) =>
                          handleConceptSelect(c, "subject", opts)
                        }
                      />
                    }
                  />
                )}
              </Box>
            ) : (
                <Box
                  ref={containerRef}
                  sx={{
                    position: "relative",
                    height: canvasHeight,
                    touchAction: "none",
                  }}
                >
                  <ConnectorsLayer
                    svgSize={graphSize}
                    groupEdges={groupEdges}
                    edges={edges}
                  />

                  {/* Every constituent paints onto this shared canvas. Each
                      builder draws its own dashed group box (with the collapse
                      and, for complements, remove controls) plus its word boxes.
                      The builders self-filter, so mounting one per possible noun
                      / the verb phrase unconditionally is safe — inactive slots
                      and toggles render nothing. Noun-phrase mode (possessor) paints
                      only its single head noun phrase — no verb, objects, or complements. */}
                  {nounPhrase ? (
                    <NounPhraseBuilder which="subject" ctx={ctx} />
                  ) : (
                    <>
                      {!nested && <NounPhraseBuilder which="subject" ctx={ctx} />}
                      <VerbPhraseBuilder ctx={ctx} />
                      <NounPhraseBuilder which="directObject" ctx={ctx} />
                      <NounPhraseBuilder which="indirectObject" ctx={ctx} />
                      {COMPLEMENT_TYPES.map((type) => (
                        <NounPhraseBuilder key={type} which={type} ctx={ctx} />
                      ))}
                    </>
                  )}

                  {/* Compact view is just the bare core-word chips — no reveal icons
                      on the box borders and no dotted-box perimeter controls. */}
                  {!compact && (
                    <SatelliteControls
                      satelliteIconsByParent={satelliteIconsByParent}
                      controlPos={controlPos}
                    />
                  )}

                  {!compact && (
                  <GroupPerimeterControls
                    groupRects={groupRects}
                    perimeterByNoun={perimeterByNoun}
                    linkTargetKeys={
                      linkBinding ? (linkBinding.linkTargetKeys as Set<NounKey>) : undefined
                    }
                    registerSourceAnchor={linkBinding?.registerLinkSourceAnchor}
                    registerTargetAnchor={linkBinding?.registerLinkTargetAnchor}
                    registerPossessorControl={(nounKey, el) => {
                      if (el) possessorControlEls.current.set(nounKey, el);
                      else possessorControlEls.current.delete(nounKey);
                    }}
                  />
                  )}
                </Box>
            )}
        </Box>

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
                if (!nested && !nounPhrase)
                  localStorage.setItem(
                    "signi:graphHeight",
                    String(Math.round(h)),
                  );
              }}
            />
          </Box>
        )}

        {showCanvas && (
          <PossessorPanels
            openPossessors={openPossessors}
            selection={selection}
            nested={nested}
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
      </Paper>

      {/* The word palette rides only the top-level builder as a slide-over
          overlay; nested clauses and possessor editors fill their slots via each
          box's inline typeahead. Its open state is owned by the page header. */}
      {!nested && !nounPhrase && (
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
}
