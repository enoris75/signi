import React, { useLayoutEffect, useRef, useState } from "react";
import { Box, Paper, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  COMPLEMENT_TYPES,
  DEFINITENESS,
  MODIFIER_RELATIONS,
  TENSES,
  type Concept,
  type ComplementType,
  type Definiteness,
  type PathSpecifier,
} from "@signi/shared";
import { VerbTypeahead } from "./VerbTypeahead.tsx";
import { SlotBox, type SatelliteIcon } from "./Boxes.tsx";
import {
  GenderSlot,
  NounKey,
  NumberSlot,
  PhraseSelection,
  POSSESSOR_KEY,
  SlotKey,
  WorkspaceBinding,
} from "./interfaces.ts";
import {
  ALL_SLOTS,
  COMPLEMENT_KEY_SET,
  COLLAPSIBLE_GROUPS,
  SATELLITE_SLOT_KEYS,
  getActiveSlots,
  DEFAULT_POSITIONS,
  GRAPH_HEIGHT,
  MIN_GRAPH_HEIGHT,
  MUI_COLOR_HEX,
} from "./slots.ts";
import { applyConceptSelect, applyClear } from "./phraseReducers.ts";
import { buildSatellites, conceptLabel, type Satellite } from "./satellites.tsx";
import { buildGraph } from "./graph.ts";
import { type PhraseRenderContext } from "./phraseRender.tsx";
import { NounPhraseBuilder } from "./NounPhraseBuilder.tsx";
import { VerbPhraseBuilder } from "./VerbPhraseBuilder.tsx";
import { ConnectorsLayer } from "./ConnectorsLayer.tsx";
import { PhraseSidebar } from "./PhraseSidebar.tsx";
import { Resizer } from "./Resizer.tsx";
import { SatelliteControls } from "./SatelliteControls.tsx";
import { GroupPerimeterControls } from "./GroupPerimeterControls.tsx";
import { computeControlPositions } from "./controlLayout.ts";

interface PhraseBuilderProps {
  selection: PhraseSelection;
  onPhraseUpdate: (updater: (prev: PhraseSelection) => PhraseSelection) => void;
  // Clause mode: this builder edits a relative clause whose subject is the external
  // `head` noun rather than a box on its own canvas. Set for every nested instance.
  nested?: boolean;
  // Noun-phrase mode: this builder edits a bare noun phrase (the possessor) — its head
  // lives in the `subject` slot and there is no verb/predicate. Docked like a clause.
  nounPhrase?: boolean;
  head?: Concept;
  // Whether the head reads as animate ("who") vs inanimate ("that"), for the label.
  relativeLabel?: string;
  onRemove?: () => void;
  // Top-level only: the word-palette overlay's open state, lifted to the page
  // header so a control there can toggle it. The panel reports its own close.
  wordsPanelOpen?: boolean;
  onWordsPanelClose?: () => void;
  // Workspace container id + the cross-container linking hooks. Present for every
  // top-level container in the workspace; absent for embedded possessor sub-builders.
  containerId?: string;
  binding?: WorkspaceBinding;
}

// The noun blocks that can carry a relative clause.
const NOUN_KEYS: NounKey[] = [
  "subject",
  "directObject",
  "indirectObject",
  ...COMPLEMENT_TYPES,
];

type DragState = {
  keys: string[];
  startX: number;
  startY: number;
  origPositions: Record<string, { x: number; y: number }>;
  moved: boolean;
};

// Equal within half a pixel on every key — used to stop the box-measuring layout
// effect from looping on sub-pixel jitter.
function sameBoxSizes(
  a: Record<string, { w: number; h: number }>,
  b: Record<string, { w: number; h: number }>,
): boolean {
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  for (const k of keysA) {
    const pb = b[k];
    if (!pb) return false;
    if (Math.abs(a[k].w - pb.w) > 0.5 || Math.abs(a[k].h - pb.h) > 0.5)
      return false;
  }
  return true;
}

// A connector from a noun box down to its (open, uncollapsed) relative-clause
// panel. Coordinates are pixels relative to the builder's root Box.
type RelConnector = {
  which: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
};

// Equal within half a pixel on every endpoint — stops the measuring layout
// effect from looping on sub-pixel jitter.
function sameRelConnectors(a: RelConnector[], b: RelConnector[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const p = a[i];
    const q = b[i];
    if (p.which !== q.which || p.color !== q.color) return false;
    if (
      Math.abs(p.x1 - q.x1) > 0.5 ||
      Math.abs(p.y1 - q.y1) > 0.5 ||
      Math.abs(p.x2 - q.x2) > 0.5 ||
      Math.abs(p.y2 - q.y2) > 0.5
    )
      return false;
  }
  return true;
}

export function PhraseBuilder({
  selection,
  onPhraseUpdate,
  nested = false,
  nounPhrase = false,
  head,
  relativeLabel,
  onRemove,
  wordsPanelOpen = false,
  onWordsPanelClose,
  binding,
}: PhraseBuilderProps) {
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(
    nounPhrase ? "subject" : "verb",
  );
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  // Which dotted role-group boxes are collapsed (keyed by group label). A
  // collapsed box shows only its main word; its satellites stay set but hidden.
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
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
  // Has the user put anything in this clause? An untouched container is `{}`; any picked
  // word, toggle, or nested possessor adds a key. Drives the remove-confirmation prompt.
  const hasContent = Object.values(selection).some(
    (v) => v != null && (typeof v !== "object" || Object.keys(v).length > 0),
  );
  // A canvas is shown for a full phrase (once a verb is chosen) or, verbless, for a
  // lone noun phrase (the possessor editor).
  const showCanvas = hasVerb || nounPhrase;
  const verbSlot = ALL_SLOTS.find((s) => s.key === "verb")!;
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
      ).filter((s) => !nested || s.key !== "subject");
  const activeSlotConfig =
    visibleSlots.find((s) => s.key === activeSlot) ?? null;

  function handleConceptSelect(concept: Concept, targetSlot?: SlotKey) {
    const slot = targetSlot ?? activeSlot;
    if (!slot) return;

    onPhraseUpdate((prev) => applyConceptSelect(prev, slot, concept));

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
    } else if (slot.endsWith("Adjective")) {
      // Any first adjective (subject / object / complement) chains to a second —
      // reveal & focus it. (Second adjectives end in "Adjective2", so are skipped.)
      const second = `${slot}2` as SlotKey;
      setRevealed((prev) => ({ ...prev, [second]: true }));
      setActiveSlot(second);
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

  // A lens onto the possessor slice hanging off `which`, seeding an empty possessor the
  // first time. Handed to the nested noun-phrase-mode PhraseBuilder as its onPhraseUpdate,
  // so its edits land inside this block's `${which}Possessor`.
  function makePossessorUpdate(which: NounKey) {
    return (updater: (prev: PhraseSelection) => PhraseSelection) =>
      onPhraseUpdate((prev) => ({
        ...prev,
        [POSSESSOR_KEY(which)]: updater(
          (prev[POSSESSOR_KEY(which)] as PhraseSelection | undefined) ?? {},
        ),
      }));
  }

  // Remove a noun block's possessor entirely and collapse its reveal.
  function handleRemovePossessor(which: NounKey) {
    onPhraseUpdate((prev) => {
      const next = { ...prev };
      delete next[POSSESSOR_KEY(which)];
      return next;
    });
    setRevealed((prev) => ({ ...prev, [`${which}Possessor`]: false }));
  }

  function handleToggleNumber(which: NumberSlot) {
    const key = `${which}Number` as keyof PhraseSelection;
    onPhraseUpdate((prev) => ({
      ...prev,
      [key]: prev[key] === "plural" ? "singular" : "plural",
    }));
  }

  function handleToggleGender(which: GenderSlot) {
    const key = `${which}Gender` as keyof PhraseSelection;
    onPhraseUpdate((prev) => ({
      ...prev,
      [key]: prev[key] === "fem" ? "masc" : "fem",
    }));
  }

  function handleToggleNegative() {
    onPhraseUpdate((prev) => ({ ...prev, verbNegative: !prev.verbNegative }));
  }

  // Cycle a noun's determiner definite → indefinite → bare → definite.
  function handleCycleDefiniteness(which: NounKey) {
    const key = `${which}Definiteness` as keyof PhraseSelection;
    onPhraseUpdate((prev) => {
      const cur = (prev[key] as Definiteness) ?? "definite";
      const idx = DEFINITENESS.indexOf(cur);
      return { ...prev, [key]: DEFINITENESS[(idx + 1) % DEFINITENESS.length] };
    });
  }

  // Cycle a noun-modifier's semantic relation (feature → purpose → material → feature),
  // stored per adjective slot key in `modifierRelations`. Only meaningful when that slot
  // holds a noun; ignored otherwise.
  function handleCycleModifierRelation(slotKey: SlotKey) {
    onPhraseUpdate((prev) => {
      const cur = prev.modifierRelations?.[slotKey] ?? "feature";
      const next = MODIFIER_RELATIONS[(MODIFIER_RELATIONS.indexOf(cur) + 1) % MODIFIER_RELATIONS.length];
      return { ...prev, modifierRelations: { ...prev.modifierRelations, [slotKey]: next } };
    });
  }

  // Cycle the verb tense present → past → future → present.
  function handleCycleTense() {
    onPhraseUpdate((prev) => {
      const idx = TENSES.indexOf(prev.verbTense ?? "present");
      return { ...prev, verbTense: TENSES[(idx + 1) % TENSES.length] };
    });
  }

  // Set the route complement's path relation (through / under / over / …).
  function handleSelectSpecifier(spec: PathSpecifier) {
    onPhraseUpdate((prev) => ({ ...prev, routeSpecifier: spec }));
  }

  const { satellites, shownMap: rawShownMap } = buildSatellites(
    selection,
    revealed,
  );

  // Collapse: force every child node of a collapsed group hidden. Because group
  // rects, rendered slots, and edges all derive from shownMap, forcing these
  // false shrinks each collapsed box down to just its main word.
  const collapsedHiddenKeys = new Set<string>();
  const collapsedMainKeys = new Set<string>();
  for (const g of COLLAPSIBLE_GROUPS) {
    if (!collapsedGroups[g.label]) continue;
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

  // Re-arrange a dotted box's child nodes into a compact, tidy cluster centered on
  // the group's current position: adjectives (and the tense chip) on a top row, the
  // main word in the middle, and the number/gender/adverb/polarity toggles on a
  // bottom row. Each row is horizontally centered, so the derived bounding box
  // shrinks to a neat, minimal footprint.
  function handleRearrangeGroup(nodeKeys: string[]) {
    if (nodeKeys.length === 0) return;
    const clamp = (v: number, lo: number, hi: number) =>
      Math.max(lo, Math.min(hi, v));
    // Convert a comfortable per-node pixel spacing into the % coordinate space.
    const stepX = (150 / Math.max(svgSize.w, 1)) * 100;
    const stepY = (68 / Math.max(svgSize.h, 1)) * 100;
    // -1 = top row (adjectives / tense), 0 = main word, 1 = bottom row (toggles).
    const tierOf = (k: string): -1 | 0 | 1 => {
      if (/Adjective2?$/.test(k) || k === "verbTense") return -1;
      if (
        /(Number|Gender|Definiteness)$/.test(k) ||
        k === "verbNegative" ||
        k === "modifier"
      )
        return 1;
      return 0;
    };
    setPositions((prev) => {
      const cur = nodeKeys.map(
        (k) => prev[k] ?? DEFAULT_POSITIONS[k] ?? { x: 50, y: 50 },
      );
      const cx = cur.reduce((s, p) => s + p.x, 0) / cur.length;
      const cy = cur.reduce((s, p) => s + p.y, 0) / cur.length;
      const rows: Record<number, string[]> = { [-1]: [], 0: [], 1: [] };
      for (const k of nodeKeys) rows[tierOf(k)].push(k);
      const next = { ...prev };
      for (const tier of [-1, 0, 1] as const) {
        const row = rows[tier];
        const rowY = clamp(cy + tier * stepY, 4, 96);
        const startX = cx - ((row.length - 1) * stepX) / 2;
        row.forEach((k, i) => {
          next[k] = { x: clamp(startX + i * stepX, 2, 98), y: rowY };
        });
      }
      return next;
    });
  }

  function handleToggleReveal(sat: Satellite) {
    const willShow = !sat.shown;
    setRevealed((prev) => ({ ...prev, [sat.key]: willShow }));
    if (willShow && SATELLITE_SLOT_KEYS.has(sat.key as SlotKey)) {
      setActiveSlot(sat.key as SlotKey);
    }
  }

  // Map each main box to the satellite toggle icons rendered on its border.
  // Complement toggles (locative/direction/source/route) are pulled out here and
  // rendered on the Verb Phrase dotted box instead of the verb box itself.
  const satelliteIconsByParent: Record<string, SatelliteIcon[]> = {};
  const complementToggleIcons: SatelliteIcon[] = [];
  // Relative-clause + possessor controls don't ride the word box border — they sit on
  // their noun's *dotted-box* perimeter and start the dotted connector line from there
  // (see GroupPerimeterControls below). Collected per noun so both can share an edge.
  const perimeterByNoun: Partial<
    Record<NounKey, { relative?: SatelliteIcon; possessor?: SatelliteIcon }>
  > = {};
  for (const sat of satellites) {
    if (!sat.available) continue;
    // The "Relative clause" satellite is a cross-container link control, not a reveal.
    // It only exists in a workspace container (needs the binding); clicking it starts a
    // link (pick a noun in another container) or, when already a source, removes it.
    const relativeNoun: NounKey | null = sat.key.endsWith("Relative")
      ? (sat.key.slice(0, -"Relative".length) as NounKey)
      : null;
    if (relativeNoun) {
      if (!binding) continue;
      const isSource = binding.linkSourceKeys.has(relativeNoun);
      (perimeterByNoun[relativeNoun] ??= {}).relative = {
        key: sat.key,
        icon: sat.icon,
        label: sat.label,
        active: isSource,
        isSet: isSource,
        valued: false,
        valueLabel: isSource ? "Linked — click to remove" : undefined,
        onToggle: () =>
          isSource
            ? binding.onRemoveLink(relativeNoun)
            : binding.onStartRelativeLink(relativeNoun),
      };
      continue;
    }
    const iconEntry: SatelliteIcon = {
      key: sat.key,
      icon: sat.icon,
      label: sat.label,
      active: sat.shown,
      isSet: sat.hasValue,
      valued: Boolean(sat.alwaysSet),
      valueLabel: sat.valueLabel,
      onToggle: () => handleToggleReveal(sat),
    };
    // The possessor reveal toggle likewise rides the dotted-box perimeter and anchors
    // its own connector down to the possessor panel.
    const possessorNoun: NounKey | null = sat.key.endsWith("Possessor")
      ? (sat.key.slice(0, -"Possessor".length) as NounKey)
      : null;
    if (possessorNoun) {
      (perimeterByNoun[possessorNoun] ??= {}).possessor = iconEntry;
      continue;
    }
    if (COMPLEMENT_KEY_SET.has(sat.key as SlotKey)) {
      complementToggleIcons.push(iconEntry);
    } else {
      // A collapsed group hides its own reveal icons; complement toggles ride
      // the verb box but belong to sibling groups, so they stay above.
      if (collapsedMainKeys.has(sat.parent)) continue;
      (satelliteIconsByParent[sat.parent] ??= []).push(iconEntry);
    }
  }

  // Satellite slots (adjective / adverb) only render when revealed or filled.
  const renderedSlots = visibleSlots.filter(
    (s) => !SATELLITE_SLOT_KEYS.has(s.key) || shownMap[s.key],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  // The outermost positioned Box — connectors from a noun to its relative-clause
  // panel are measured relative to this, since the panels live below the canvas.
  const rootRef = useRef<HTMLDivElement>(null);
  // Each open possessor panel's wrapper element, keyed by its noun block. (Relative
  // clauses are separate workspace containers now, not docked panels.)
  const possessorPanelEls = useRef<Map<string, HTMLElement>>(new Map());
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
  }, [hasVerb]);

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
      if (label && collapsedGroups[label]) return;
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
  }, [notifyGeometry, positions, boxSizes, svgSize, graphHeight, collapsedGroups]);

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

  function pos(key: string) {
    return positions[key] ?? DEFAULT_POSITIONS[key];
  }

  // Canvas-pixel position of each satellite reveal control, keyed by satellite
  // key; also fed to buildGraph as each link's origin (see controlLayout).
  const controlPos = computeControlPositions({
    satelliteIconsByParent,
    boxSizes,
    pos,
    svgSize,
  });

  const { edges, groupRects, groupEdges } = buildGraph({
    hasVerb,
    nounPhrase,
    // The possessor's own head is a box on this canvas; in a relative clause the
    // subject is the external head, so it isn't drawn.
    showSubject: nounPhrase ? true : !nested,
    renderedSlots,
    visibleSlots,
    shownMap,
    pos,
    controlPos,
    svgSize,
  });

  // Noun blocks whose possessor panel is currently open (revealed or already filled).
  const openPossessors = NOUN_KEYS.filter(
    (which) => selection[which] && shownMap[`${which}Possessor`],
  );

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
    collapsedGroups,
    draggingKey,
    makeDragProps,
    makeGroupDragProps,
    slotEls,
    handleSlotClick,
    handleConceptSelect,
    handleClear,
    handleToggleNumber,
    handleToggleGender,
    handleCycleDefiniteness,
    handleCycleModifierRelation,
    handleToggleNegative,
    handleCycleTense,
    handleSelectSpecifier,
    handleToggleCollapse,
    handleRearrangeGroup,
    handleRemoveComplement,
    // Cross-container linking: forward noun boxes to the workspace registry and expose
    // greying (link targets) + pick-mode (eligible targets). Only NOUN_KEYS participate.
    onBoxRef: binding
      ? (key, el) => {
          if (NOUN_KEYS.includes(key as NounKey))
            binding.registerBox(key as NounKey, el);
        }
      : undefined,
    dimmedKeys: binding ? (binding.linkTargetKeys as Set<string>) : undefined,
    isPickTarget: binding
      ? (key) =>
          NOUN_KEYS.includes(key as NounKey) && binding.isPickTarget(key as NounKey)
      : undefined,
    onPickTarget: binding ? (key) => binding.onNounPick(key as NounKey) : undefined,
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
          // Nested panels stay docked; workspace containers (binding present) stay in
          // the managed stack so cross-container connectors measure correctly.
          if (nested || binding) return;
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
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          // Every phrase — the main clause and each nested relative/possessor — sits
          // in the same accent container (left rule + tinted bg). The rule's colour
          // marks the kind: possessor info, relative primary, main clause neutral.
          borderLeft: "3px solid",
          borderLeftColor: nounPhrase
            ? "info.light"
            : nested
              ? "primary.light"
              : "text.secondary",
          bgcolor: "action.hover",
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
              Main clause{" "}
              <Box
                component="span"
                sx={{ color: "text.disabled", fontWeight: 500 }}
              >
                ·{" "}
                {hasVerb
                  ? "click a slot then choose a word"
                  : "start by choosing a verb"}
              </Box>
            </Typography>
            {onRemove && (
              <IconButton
                size="small"
                onClick={() => {
                  // Confirm only when there's work to lose; an empty clause deletes silently.
                  if (
                    hasContent &&
                    !window.confirm("Remove this main clause and everything in it?")
                  )
                    return;
                  onRemove();
                }}
                aria-label="Remove main clause"
                sx={{ p: 0.25 }}
              >
                <CloseIcon sx={{ fontSize: 15 }} />
              </IconButton>
            )}
          </Box>
        )}

        <Box sx={{ minWidth: 0 }}>
          {!showCanvas ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
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
              </Box>
            ) : (
              <>
                <Box
                  ref={containerRef}
                  sx={{
                    position: "relative",
                    height: graphHeight,
                    touchAction: "none",
                  }}
                >
                  <ConnectorsLayer
                    svgSize={svgSize}
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

                  <SatelliteControls
                    satelliteIconsByParent={satelliteIconsByParent}
                    controlPos={controlPos}
                  />

                  <GroupPerimeterControls
                    groupRects={groupRects}
                    perimeterByNoun={perimeterByNoun}
                    linkTargetKeys={
                      binding ? (binding.linkTargetKeys as Set<NounKey>) : undefined
                    }
                    registerSourceAnchor={binding?.registerLinkSourceAnchor}
                    registerTargetAnchor={binding?.registerLinkTargetAnchor}
                    registerPossessorControl={(nounKey, el) => {
                      if (el) possessorControlEls.current.set(nounKey, el);
                      else possessorControlEls.current.delete(nounKey);
                    }}
                  />
                </Box>

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
              </>
            )}
        </Box>
      </Paper>

        {/* Possessor editors — one per noun block with an open possessor. Each is a
            verbless noun-phrase-mode PhraseBuilder editing that block's `${which}Possessor`
            slice (a noun phrase whose head is its `subject`); because it is the same
            builder, the possessor gets the full noun-phrase surface — adjectives,
            number/gender, a relative clause, and its own nested possessor. */}
        {showCanvas &&
          openPossessors.map((which) => {
            const nounHead = selection[which] as Concept;
            const possColor =
              MUI_COLOR_HEX[ALL_SLOTS.find((s) => s.key === which)?.color ?? "primary"];
            return (
              <Box
                key={which}
                ref={(el: HTMLDivElement | null) => {
                  if (el) possessorPanelEls.current.set(which, el);
                  else possessorPanelEls.current.delete(which);
                }}
                sx={{ position: "relative", mt: 1.5, pl: nested ? 1 : 2 }}
              >
                {/* Receiving dot on the panel's top edge — where this noun's possessor
                    connector lands. */}
                <Box
                  ref={(el: HTMLDivElement | null) => {
                    if (el) possessorDotEls.current.set(which, el);
                    else possessorDotEls.current.delete(which);
                  }}
                  sx={{
                    position: "absolute",
                    left: nested ? 8 + 20 : 16 + 20,
                    top: 0,
                    transform: "translate(-50%, -50%)",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: possColor,
                    border: "2px solid",
                    borderColor: "background.paper",
                    zIndex: 2,
                  }}
                />
                <PhraseBuilder
                  nounPhrase
                  head={nounHead}
                  relativeLabel="'s"
                  selection={
                    (selection[POSSESSOR_KEY(which)] as PhraseSelection | undefined) ??
                    {}
                  }
                  onPhraseUpdate={makePossessorUpdate(which)}
                  onRemove={() => handleRemovePossessor(which)}
                />
              </Box>
            );
          })}

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
