import React, { useLayoutEffect, useRef, useState } from "react";
import { Box, Paper, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  COMPLEMENT_TYPES,
  TENSES,
  type Concept,
  type ComplementType,
  type PathSpecifier,
} from "@signi/shared";
import { VerbTypeahead } from "./VerbTypeahead.tsx";
import { SlotBox, SatelliteButton, type SatelliteIcon } from "./Boxes.tsx";
import {
  GenderSlot,
  NounKey,
  NumberSlot,
  PhraseSelection,
  RELATIVE_KEY,
  SlotKey,
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

interface PhraseBuilderProps {
  selection: PhraseSelection;
  onPhraseUpdate: (updater: (prev: PhraseSelection) => PhraseSelection) => void;
  // Clause mode: this builder edits a relative clause whose subject is the external
  // `head` noun rather than a box on its own canvas. Set for every nested instance.
  nested?: boolean;
  head?: Concept;
  // Whether the head reads as animate ("who") vs inanimate ("that"), for the label.
  relativeLabel?: string;
  onRemove?: () => void;
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

// Where the ray from a box's center toward a target crosses the box border,
// padded outward a touch so a control placed there straddles the edge. Both
// points and the returned point are in canvas pixels.
function borderPoint(
  center: { x: number; y: number },
  size: { w: number; h: number },
  target: { x: number; y: number },
  pad: number,
): { x: number; y: number } {
  const hw = size.w / 2 + pad;
  const hh = size.h / 2 + pad;
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  if (dx === 0 && dy === 0) return { x: center.x, y: center.y - hh };
  const scale = 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh);
  return { x: center.x + dx * scale, y: center.y + dy * scale };
}

// Place a box's satellite controls on its border, each on the ray toward its
// target node. Controls that land on the same spot (targets collinear with the
// box center) are fanned out along that border edge so they don't overlap.
function layoutControls(
  center: { x: number; y: number },
  size: { w: number; h: number },
  targets: { key: string; target: { x: number; y: number } }[],
): Record<string, { x: number; y: number }> {
  const GAP = 22; // control button + a hair of breathing room, in px
  const raw = targets.map((t) => ({
    key: t.key,
    p: borderPoint(center, size, t.target, 2),
    dx: t.target.x - center.x,
    dy: t.target.y - center.y,
  }));
  // Cluster near-coincident border points.
  const clusters: (typeof raw)[] = [];
  for (const it of raw) {
    const cl = clusters.find(
      (c) => Math.hypot(c[0].p.x - it.p.x, c[0].p.y - it.p.y) < GAP,
    );
    if (cl) cl.push(it);
    else clusters.push([it]);
  }
  const out: Record<string, { x: number; y: number }> = {};
  for (const items of clusters) {
    if (items.length === 1) {
      out[items[0].key] = items[0].p;
      continue;
    }
    // Spread the cluster along the tangent of its shared outward direction —
    // which, on a box edge, runs along that edge.
    const bx = items.reduce((s, i) => s + i.p.x, 0) / items.length;
    const by = items.reduce((s, i) => s + i.p.y, 0) / items.length;
    const adx = items.reduce((s, i) => s + i.dx, 0) / items.length;
    const ady = items.reduce((s, i) => s + i.dy, 0) / items.length;
    const len = Math.hypot(adx, ady) || 1;
    const tx = -ady / len;
    const ty = adx / len;
    const sorted = [...items].sort((a, b) => (a.key < b.key ? -1 : 1));
    sorted.forEach((it, i) => {
      const off = (i - (sorted.length - 1) / 2) * GAP;
      out[it.key] = { x: bx + tx * off, y: by + ty * off };
    });
  }
  return out;
}

export function PhraseBuilder({
  selection,
  onPhraseUpdate,
  nested = false,
  head,
  relativeLabel,
  onRemove,
}: PhraseBuilderProps) {
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>("verb");
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
  const verbSlot = ALL_SLOTS.find((s) => s.key === "verb")!;
  const visibleSlots = getActiveSlots(
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

  // A lens: update the relative-clause slice hanging off `which`, seeding an empty
  // clause the first time. Handed to the nested clause-mode PhraseBuilder as its
  // onPhraseUpdate, so all its edits land inside this block's `${which}Relative`.
  function makeRelativeUpdate(which: NounKey) {
    return (updater: (prev: PhraseSelection) => PhraseSelection) =>
      onPhraseUpdate((prev) => ({
        ...prev,
        [RELATIVE_KEY(which)]: updater(
          (prev[RELATIVE_KEY(which)] as PhraseSelection | undefined) ?? {},
        ),
      }));
  }

  // Remove a noun block's relative clause entirely and collapse its reveal.
  function handleRemoveRelative(which: NounKey) {
    onPhraseUpdate((prev) => {
      const next = { ...prev };
      delete next[RELATIVE_KEY(which)];
      return next;
    });
    setRevealed((prev) => ({ ...prev, [`${which}Relative`]: false }));
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
      if (/(Number|Gender)$/.test(k) || k === "verbNegative" || k === "modifier")
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
  for (const sat of satellites) {
    if (!sat.available) continue;
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
  // Each open relative-clause panel's wrapper element, keyed by its noun block.
  const relativePanelEls = useRef<Map<string, HTMLElement>>(new Map());
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
    // Nested clause canvases start shorter and don't persist (the global key is
    // shared, so many instances would clobber each other).
    if (nested) return MIN_GRAPH_HEIGHT + 60;
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

  // After every render, measure a connector from each open, uncollapsed noun to
  // its relative-clause panel below the canvas. Both the noun box and the panel
  // are measured relative to the root Box, so the SVG overlay can span the gap
  // between the canvas and the docked clause panels. Guarded so it settles.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const clamp = (v: number, lo: number, hi: number) =>
      Math.max(lo, Math.min(hi, v));
    const next: RelConnector[] = [];
    for (const which of openRelatives) {
      // Skip the connector while the noun's group box is collapsed.
      const label = COLLAPSIBLE_GROUPS.find((g) => g.mainKey === which)?.label;
      if (label && collapsedGroups[label]) continue;
      const boxEl = slotEls.current.get(which as SlotKey);
      const panelEl = relativePanelEls.current.get(which);
      if (!boxEl || !panelEl) continue;
      const b = boxEl.getBoundingClientRect();
      const p = panelEl.getBoundingClientRect();
      const x1 = b.left + b.width / 2 - rootRect.left;
      const y1 = b.bottom - rootRect.top;
      const y2 = p.top - rootRect.top;
      // Land on the panel's top edge directly below the noun where possible,
      // clamped a little inside the panel so the line meets it cleanly.
      const x2 = clamp(x1, p.left - rootRect.left + 14, p.right - rootRect.left - 14);
      const color =
        MUI_COLOR_HEX[ALL_SLOTS.find((s) => s.key === which)?.color ?? "primary"];
      next.push({ which, x1, y1, x2, y2, color });
    }
    setRelConnectors((prev) => (sameRelConnectors(prev, next) ? prev : next));
  });

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

  // Place each satellite reveal control on its core box's border, on the ray toward
  // the satellite it governs — so the control migrates around the box to face its
  // node and the connector leaves the box cleanly from the control. Canvas pixels,
  // keyed by satellite key; also fed to buildGraph as each link's origin.
  const pxPt = (key: string) => ({
    x: (pos(key).x / 100) * svgSize.w,
    y: (pos(key).y / 100) * svgSize.h,
  });
  const controlPos: Record<string, { x: number; y: number }> = {};
  for (const [parentKey, icons] of Object.entries(satelliteIconsByParent)) {
    const size = boxSizes[parentKey];
    if (!size) continue;
    Object.assign(
      controlPos,
      layoutControls(
        pxPt(parentKey),
        size,
        icons.map((icon) => ({ key: icon.key, target: pxPt(icon.key) })),
      ),
    );
  }

  const { edges, groupRects, groupEdges } = buildGraph({
    hasVerb,
    showSubject: !nested,
    renderedSlots,
    visibleSlots,
    shownMap,
    pos,
    controlPos,
    svgSize,
  });

  // Noun blocks whose relative-clause panel is currently open (revealed or already
  // has content). Each renders a nested clause-mode PhraseBuilder below the canvas.
  const openRelatives = NOUN_KEYS.filter(
    (which) => selection[which] && shownMap[`${which}Relative`],
  );

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
    handleToggleNegative,
    handleCycleTense,
    handleSelectSpecifier,
    handleToggleCollapse,
    handleRearrangeGroup,
    handleRemoveComplement,
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
          if (nested) return; // nested clause panels stay docked, never float
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
          ...(nested && {
            borderLeft: "3px solid",
            borderLeftColor: "primary.light",
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
        {nested ? (
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
                aria-label="Remove relative clause"
                sx={{ p: 0.25 }}
              >
                <CloseIcon sx={{ fontSize: 15 }} />
              </IconButton>
            )}
          </Box>
        ) : (
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "text.secondary",
              mb: 1.5,
            }}
          >
            {hasVerb
              ? "Compose your phrase — click a slot then choose a word"
              : "Start by choosing a verb"}
          </Typography>
        )}

        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {!hasVerb ? (
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
                      and toggles render nothing. */}
                  {!nested && <NounPhraseBuilder which="subject" ctx={ctx} />}
                  <VerbPhraseBuilder ctx={ctx} />
                  <NounPhraseBuilder which="directObject" ctx={ctx} />
                  <NounPhraseBuilder which="indirectObject" ctx={ctx} />
                  {COMPLEMENT_TYPES.map((type) => (
                    <NounPhraseBuilder key={type} which={type} ctx={ctx} />
                  ))}

                  {/* Satellite reveal controls — each pinned to its core box's
                      border facing the satellite it governs (see controlPos), so
                      the connector starts from the control. Complement toggles are
                      excluded here; they ride the Verb Phrase dotted box. */}
                  {Object.entries(satelliteIconsByParent).flatMap(
                    ([parentKey, icons]) => {
                      const color =
                        ALL_SLOTS.find((s) => s.key === parentKey)?.color ??
                        "primary";
                      return icons.map((icon) => {
                        const p = controlPos[icon.key];
                        if (!p) return null;
                        return (
                          <Box
                            key={icon.key}
                            sx={{
                              position: "absolute",
                              left: p.x,
                              top: p.y,
                              transform: "translate(-50%, -50%)",
                              zIndex: 2,
                            }}
                          >
                            <SatelliteButton sat={icon} color={color} />
                          </Box>
                        );
                      });
                    },
                  )}
                </Box>

                <Resizer
                  height={graphHeight}
                  minHeight={MIN_GRAPH_HEIGHT}
                  onResize={setGraphHeight}
                  onResizeEnd={(h) => {
                    if (!nested)
                      localStorage.setItem(
                        "signi:graphHeight",
                        String(Math.round(h)),
                      );
                  }}
                />
              </>
            )}
          </Box>
          {/* The word palette rides only the top-level builder; nested clauses fill
              their slots via each box's inline typeahead. */}
          {!nested && (
            <PhraseSidebar
              width={sidebarWidth}
              onWidthChange={setSidebarWidth}
              maxHeight={graphHeight}
              selection={selection}
              activeSlot={activeSlot}
              activeSlotConfig={activeSlotConfig}
              visibleSlots={visibleSlots}
              onSlotClick={handleSlotClick}
              onConceptSelect={handleConceptSelect}
            />
          )}
        </Box>

        {/* Nested relative-clause builders — one per noun block with an open clause.
            Each is a clause-mode PhraseBuilder editing that block's `${which}Relative`
            slice; because they recurse, a clause's own objects can sprout deeper
            clauses. */}
        {hasVerb &&
          openRelatives.map((which) => {
            const nounHead = selection[which] as Concept;
            const label = nounHead?.animate ? "who" : "that";
            return (
              <Box
                key={which}
                ref={(el: HTMLDivElement | null) => {
                  if (el) relativePanelEls.current.set(which, el);
                  else relativePanelEls.current.delete(which);
                }}
                sx={{ mt: 1.5, pl: nested ? 1 : 2 }}
              >
                <PhraseBuilder
                  nested
                  head={nounHead}
                  relativeLabel={label}
                  selection={
                    (selection[RELATIVE_KEY(which)] as PhraseSelection | undefined) ??
                    {}
                  }
                  onPhraseUpdate={makeRelativeUpdate(which)}
                  onRemove={() => handleRemoveRelative(which)}
                />
              </Box>
            );
          })}
      </Paper>
    </Box>
  );
}
