import React, { ReactNode, useLayoutEffect, useRef, useState } from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";
import BrushIcon from "@mui/icons-material/Brush";
import NumbersIcon from "@mui/icons-material/Numbers";
import WcIcon from "@mui/icons-material/Wc";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import TuneIcon from "@mui/icons-material/Tune";
import type { Concept, GrammaticalRole, Transitivity } from "@signi/shared";
import ConceptPalette from "../ConceptPalette.tsx";
import { IndirectObjectTypeahead } from "./IndirectObjectTypeahead.tsx";
import { DirectObjectTypeahead } from "./DirectObjectTypeahead.tsx";
import { AdjectiveTypeahead } from "./AdjectiveTypeahead.tsx";
import { SubjectTypeahead } from "./SubjectTypeahead.tsx";
import { VerbTypeahead } from "./VerbTypeahead.tsx";
import {
  SlotBox,
  NumberToggleBox,
  GenderToggleBox,
  NegativeToggleBox,
  type SatelliteIcon,
} from "./Boxes.tsx";
import {
  GenderSlot,
  NumberSlot,
  PhraseSelection,
  SlotConfig,
  SlotKey,
} from "./interfaces.ts";

const ALL_SLOTS: SlotConfig[] = [
  {
    key: "subjectAdjective",
    label: "Adjective",
    required: false,
    roles: ["adjective"],
    color: "error",
  },
  {
    key: "subjectAdjective2",
    label: "Adjective 2",
    required: false,
    roles: ["adjective"],
    color: "error",
  },
  {
    key: "subject",
    label: "Subject",
    required: true,
    roles: ["pronoun", "noun"],
    color: "primary",
  },
  {
    key: "verb",
    label: "Verb",
    required: true,
    roles: ["verb"],
    color: "secondary",
  },
  {
    key: "directObject",
    label: "Direct Object",
    required: false,
    roles: ["noun"],
    color: "success",
  },
  {
    key: "indirectObject",
    label: "Indirect Object",
    required: false,
    roles: ["noun"],
    color: "warning",
  },
  {
    key: "modifier",
    label: "Adverb",
    required: false,
    roles: ["adverb"],
    color: "info",
  },
];

const SATELLITE_SLOT_KEYS = new Set<SlotKey>([
  "subjectAdjective",
  "subjectAdjective2",
  "modifier",
]);

export function getActiveSlots(
  transitivity?: Transitivity,
  subjectRole?: GrammaticalRole,
  hasSubjectAdjective?: boolean,
): SlotConfig[] {
  return ALL_SLOTS.filter((slot) => {
    if (slot.key === "directObject") return transitivity !== "intransitive";
    if (slot.key === "indirectObject") return transitivity === "ditransitive";
    if (slot.key === "subjectAdjective") return subjectRole === "noun";
    if (slot.key === "subjectAdjective2") return subjectRole === "noun" && hasSubjectAdjective;
    return true;
  });
}

interface PhraseBuilderProps {
  selection: PhraseSelection;
  onPhraseUpdate: (updater: (prev: PhraseSelection) => PhraseSelection) => void;
}

const NODE_POS: Record<SlotKey, { x: number; y: number }> = {
  subjectAdjective: { x: 12, y: 14 },
  subjectAdjective2: { x: 12, y: 26 },
  subject: { x: 26, y: 42 },
  verb: { x: 52, y: 42 },
  directObject: { x: 80, y: 42 },
  indirectObject: { x: 76, y: 74 },
  modifier: { x: 52, y: 74 },
};

const NUMBER_TOGGLE_DEFAULTS: Record<NumberSlot, { x: number; y: number }> = {
  subject: { x: 12, y: 72 },
  directObject: { x: 80, y: 62 },
  indirectObject: { x: 90, y: 88 },
};

const NUMBER_TOGGLE_KEY = (which: NumberSlot) => `${which}Number`;

const GENDER_TOGGLE_KEY = (which: GenderSlot) => `${which}Gender`;

const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  ...NODE_POS,
  subjectNumber: NUMBER_TOGGLE_DEFAULTS.subject,
  subjectGender: { x: 12, y: 57 },
  subjectAdjective2Gender: { x: 20, y: 26 },
  verbNegative: { x: 52, y: 62 },
  directObjectNumber: NUMBER_TOGGLE_DEFAULTS.directObject,
  directObjectGender: { x: 93, y: 30 },
  indirectObjectNumber: NUMBER_TOGGLE_DEFAULTS.indirectObject,
  indirectObjectGender: { x: 88, y: 62 },
};

const MUI_COLOR_HEX: Record<SlotConfig["color"], string> = {
  primary: "#2c4a6e",
  secondary: "#8b3e2a",
  success: "#3a6e3a",
  warning: "#8b6914",
  info: "#2a6e7c",
  error: "#8b1a1a",
};

const GRAPH_HEIGHT = 340;
const MIN_GRAPH_HEIGHT = 160;

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
}: PhraseBuilderProps) {
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>("verb");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem("signi:phraseBuilderSidebarWidth");
    return saved ? Number(saved) : 160;
  });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const borderDragRef = useRef<{ startX: number; startY: number; startPos: { x: number; y: number } } | null>(null);
  const hasVerb = Boolean(selection.verb);
  const verbSlot = ALL_SLOTS.find((s) => s.key === "verb")!;
  const visibleSlots = getActiveSlots(
    selection.verb?.transitivity,
    selection.subject?.role,
    Boolean(selection.subjectAdjective),
  );
  const activeSlotConfig =
    visibleSlots.find((s) => s.key === activeSlot) ?? null;

  function handleConceptSelect(concept: Concept, targetSlot?: SlotKey) {
    const slot = targetSlot ?? activeSlot;
    if (!slot) return;

    onPhraseUpdate((prev) => {
      const next = { ...prev, [slot]: concept };
      if (slot === "verb") {
        const nowVisible = getActiveSlots(
          concept.transitivity,
          prev.subject?.role,
        ).map((s) => s.key);
        if (!nowVisible.includes("directObject")) {
          delete next.directObject;
          delete next.directObjectNumber;
        }
        if (!nowVisible.includes("indirectObject")) {
          delete next.indirectObject;
          delete next.indirectObjectNumber;
        }
        if (!nowVisible.includes("subjectAdjective"))
          delete next.subjectAdjective;
      }
      if (slot === "subject") {
        delete next.subjectAdjective;
        delete next.subjectAdjective2;
        if (concept.role === "pronoun") {
          next.subjectNumber = "singular";
          if (concept.person === "3") {
            next.subjectGender = prev.subjectGender ?? "masc";
          } else {
            delete next.subjectGender;
          }
        } else if (concept.role === "noun") {
          if (concept.gendered) {
            next.subjectGender = prev.subjectGender ?? "masc";
          } else {
            delete next.subjectGender;
          }
        } else {
          delete next.subjectNumber;
          delete next.subjectGender;
        }
      }
      if (slot === "directObject") {
        if (concept.gendered) {
          next.directObjectGender = prev.directObjectGender ?? "masc";
        } else {
          delete next.directObjectGender;
        }
      }
      if (slot === "indirectObject") {
        if (concept.gendered) {
          next.indirectObjectGender = prev.indirectObjectGender ?? "masc";
        } else {
          delete next.indirectObjectGender;
        }
      }
      return next;
    });

    // Auto-advance to next empty slot (only among the main, always-visible slots)
    let slots = visibleSlots;
    if (slot === "verb") {
      slots = getActiveSlots(concept.transitivity, selection.subject?.role, Boolean(selection.subjectAdjective));
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
    } else if (slot === "subjectAdjective") {
      // Reveal & focus the chained second adjective.
      setRevealed((prev) => ({ ...prev, subjectAdjective2: true }));
      setActiveSlot("subjectAdjective2");
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
    onPhraseUpdate((prev) => {
      const next = { ...prev };
      delete next[slot];
      if (slot === "verb") {
        delete next.directObject;
        delete next.directObjectNumber;
        delete next.directObjectGender;
        delete next.indirectObject;
        delete next.indirectObjectNumber;
        delete next.indirectObjectGender;
        delete next.subjectAdjective;
        delete next.subjectAdjective2;
      }
      if (slot === "subject") {
        delete next.subjectAdjective;
        delete next.subjectAdjective2;
        delete next.subjectNumber;
        delete next.subjectGender;
      }
      if (slot === "subjectAdjective") {
        delete next.subjectAdjective2;
      }
      if (slot === "directObject") {
        delete next.directObjectNumber;
        delete next.directObjectGender;
      }
      if (slot === "indirectObject") {
        delete next.indirectObjectNumber;
        delete next.indirectObjectGender;
      }
      return next;
    });
    if (slot === "verb") setActiveSlot("verb");
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

  const showSubjectNumber = Boolean(selection.subject);
  const showSubjectGender =
    (selection.subject?.role === "pronoun" &&
      selection.subject?.person === "3") ||
    (selection.subject?.role === "noun" &&
      Boolean(selection.subject?.gendered));
  const showDirectObjNumber = Boolean(selection.directObject);
  const showDirectObjGender = Boolean(selection.directObject?.gendered);
  const showIndirectObjNumber = Boolean(selection.indirectObject);
  const showIndirectObjGender = Boolean(selection.indirectObject?.gendered);

  // Satellite elements (gender / number / polarity / adjective / adverb) are
  // hidden by default and revealed via the small icons on each main box border.
  type Satellite = {
    key: string;
    parent: SlotKey;
    label: string;
    icon: ReactNode;
    available: boolean;
    hasValue: boolean;
    // Human-readable current term, shown in the icon tooltip when collapsed.
    valueLabel?: string;
    shown: boolean;
  };
  const iconSx = { fontSize: 13 };
  const subjectRole = selection.subject?.role;
  const conceptLabel = (c?: Concept) =>
    c ? (c.role === "pronoun" ? c.description : (c.label ?? c.description)) : undefined;
  const rawSatellites: Omit<Satellite, "shown">[] = [
    {
      key: "subjectAdjective",
      parent: "subject",
      label: "Adjective",
      icon: <BrushIcon sx={iconSx} />,
      available: subjectRole === "noun",
      hasValue: Boolean(selection.subjectAdjective),
      valueLabel: conceptLabel(selection.subjectAdjective),
    },
    {
      key: "subjectAdjective2",
      parent: "subject",
      label: "Adjective 2",
      icon: <BrushIcon sx={iconSx} />,
      available: subjectRole === "noun" && Boolean(selection.subjectAdjective),
      hasValue: Boolean(selection.subjectAdjective2),
      valueLabel: conceptLabel(selection.subjectAdjective2),
    },
    {
      key: "subjectNumber",
      parent: "subject",
      label: "Number",
      icon: <NumbersIcon sx={iconSx} />,
      available: showSubjectNumber,
      hasValue: selection.subjectNumber === "plural",
      valueLabel: "Plural",
    },
    {
      key: "subjectGender",
      parent: "subject",
      label: "Gender",
      icon: <WcIcon sx={iconSx} />,
      available: showSubjectGender,
      hasValue: selection.subjectGender === "fem",
      valueLabel: "Feminine",
    },
    {
      key: "verbNegative",
      parent: "verb",
      label: "Polarity",
      icon: <RemoveCircleOutlineIcon sx={iconSx} />,
      available: true,
      hasValue: Boolean(selection.verbNegative),
      valueLabel: "Negative",
    },
    {
      key: "modifier",
      parent: "verb",
      label: "Adverb",
      icon: <TuneIcon sx={iconSx} />,
      available: true,
      hasValue: Boolean(selection.modifier),
      valueLabel: conceptLabel(selection.modifier),
    },
    {
      key: "directObjectNumber",
      parent: "directObject",
      label: "Number",
      icon: <NumbersIcon sx={iconSx} />,
      available: showDirectObjNumber,
      hasValue: selection.directObjectNumber === "plural",
      valueLabel: "Plural",
    },
    {
      key: "directObjectGender",
      parent: "directObject",
      label: "Gender",
      icon: <WcIcon sx={iconSx} />,
      available: showDirectObjGender,
      hasValue: selection.directObjectGender === "fem",
      valueLabel: "Feminine",
    },
    {
      key: "indirectObjectNumber",
      parent: "indirectObject",
      label: "Number",
      icon: <NumbersIcon sx={iconSx} />,
      available: showIndirectObjNumber,
      hasValue: selection.indirectObjectNumber === "plural",
      valueLabel: "Plural",
    },
    {
      key: "indirectObjectGender",
      parent: "indirectObject",
      label: "Gender",
      icon: <WcIcon sx={iconSx} />,
      available: showIndirectObjGender,
      hasValue: selection.indirectObjectGender === "fem",
      valueLabel: "Feminine",
    },
  ];
  const satellites: Satellite[] = rawSatellites.map((s) => ({
    ...s,
    // An explicit toggle wins; otherwise a set satellite auto-expands.
    shown: s.available && (revealed[s.key] ?? s.hasValue),
  }));
  const shownMap: Record<string, boolean> = Object.fromEntries(
    satellites.map((s) => [s.key, s.shown]),
  );

  function handleToggleReveal(sat: Satellite) {
    const willShow = !sat.shown;
    setRevealed((prev) => ({ ...prev, [sat.key]: willShow }));
    if (willShow && SATELLITE_SLOT_KEYS.has(sat.key as SlotKey)) {
      setActiveSlot(sat.key as SlotKey);
    }
  }

  // Map each main box to the satellite toggle icons rendered on its border.
  const satelliteIconsByParent: Record<string, SatelliteIcon[]> = {};
  for (const sat of satellites) {
    if (!sat.available) continue;
    (satelliteIconsByParent[sat.parent] ??= []).push({
      key: sat.key,
      icon: sat.icon,
      label: sat.label,
      active: sat.shown,
      isSet: sat.hasValue,
      valueLabel: sat.valueLabel,
      onToggle: () => handleToggleReveal(sat),
    });
  }

  // Satellite slots (adjective / adverb) only render when revealed or filled.
  const renderedSlots = visibleSlots.filter(
    (s) => !SATELLITE_SLOT_KEYS.has(s.key) || shownMap[s.key],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const slotEls = useRef<Map<SlotKey, HTMLElement>>(new Map());
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

  const px = (pct: number, dim: number) => (pct / 100) * dim;

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

  function startGroupDrag(
    e: React.PointerEvent<SVGRectElement>,
    nodeKeys: string[],
  ) {
    e.stopPropagation();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
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
    const pos = positions[key] ?? DEFAULT_POSITIONS[key];
    return {
      onPointerDown: (e: React.PointerEvent) => startDrag(e, key),
      onPointerMove: moveDrag,
      onPointerUp: () => endDrag(onActivate),
      onPointerCancel: () => endDrag(),
      sx: {
        position: "absolute" as const,
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isDragging ? 10 : 1,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        outline: "none",
      },
    };
  }

  function pos(key: string) {
    return positions[key] ?? DEFAULT_POSITIONS[key];
  }

  // Build SVG edges
  const edges: Array<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    color: string;
  }> = [];
  if (hasVerb) {
    for (const slot of renderedSlots) {
      if (slot.key === "verb") continue;
      const from =
        slot.key === "subjectAdjective" || slot.key === "subjectAdjective2" ? pos("subject") : pos("verb");
      edges.push({ from, to: pos(slot.key), color: MUI_COLOR_HEX[slot.color] });
    }
    if (shownMap.verbNegative)
      edges.push({ from: pos("verb"), to: pos("verbNegative"), color: MUI_COLOR_HEX.secondary });
    if (shownMap.subjectNumber)
      edges.push({
        from: pos("subject"),
        to: pos("subjectNumber"),
        color: "#888",
      });
    if (shownMap.subjectGender)
      edges.push({
        from: pos("subject"),
        to: pos("subjectGender"),
        color: "#888",
      });
    if (shownMap.directObjectNumber)
      edges.push({
        from: pos("directObject"),
        to: pos("directObjectNumber"),
        color: MUI_COLOR_HEX.success,
      });
    if (shownMap.directObjectGender)
      edges.push({
        from: pos("directObject"),
        to: pos("directObjectGender"),
        color: MUI_COLOR_HEX.success,
      });
    if (shownMap.indirectObjectNumber)
      edges.push({
        from: pos("indirectObject"),
        to: pos("indirectObjectNumber"),
        color: MUI_COLOR_HEX.warning,
      });
    if (shownMap.indirectObjectGender)
      edges.push({
        from: pos("indirectObject"),
        to: pos("indirectObjectGender"),
        color: MUI_COLOR_HEX.warning,
      });
  }

  // Build role-group bounding rects (coordinates in SVG pixels = CSS pixels since viewBox matches container)
  const PIX_PAD_H = 80; // left & right — covers widest slot box half-width
  const PIX_PAD_TOP = 35;
  const PIX_PAD_BOT = 40;
  type GroupRect = {
    label: string;
    color: string;
    nodeKeys: string[];
    x: number;
    y: number;
    width: number;
    height: number;
  };
  const groupRects: GroupRect[] = [];
  if (hasVerb) {
    const roleGroups: Array<{
      label: string;
      color: string;
      nodeKeys: string[];
    }> = [
      {
        label: "Subject",
        color: MUI_COLOR_HEX.primary,
        nodeKeys: [
          ...(shownMap.subjectAdjective ? ["subjectAdjective"] : []),
          ...(shownMap.subjectAdjective2 ? ["subjectAdjective2"] : []),
          "subject",
          ...(shownMap.subjectNumber ? ["subjectNumber"] : []),
          ...(shownMap.subjectGender ? ["subjectGender"] : []),
        ],
      },
      {
        label: "Verb Phrase",
        color: MUI_COLOR_HEX.secondary,
        nodeKeys: [
          "verb",
          ...(shownMap.verbNegative ? ["verbNegative"] : []),
          ...(shownMap.modifier ? ["modifier"] : []),
        ],
      },
      ...(visibleSlots.some((s) => s.key === "directObject")
        ? [
            {
              label: "Direct Object",
              color: MUI_COLOR_HEX.success,
              nodeKeys: [
                "directObject",
                ...(shownMap.directObjectNumber ? ["directObjectNumber"] : []),
                ...(shownMap.directObjectGender ? ["directObjectGender"] : []),
              ],
            },
          ]
        : []),
      ...(visibleSlots.some((s) => s.key === "indirectObject")
        ? [
            {
              label: "Indirect Object",
              color: MUI_COLOR_HEX.warning,
              nodeKeys: [
                "indirectObject",
                ...(shownMap.indirectObjectNumber ? ["indirectObjectNumber"] : []),
                ...(shownMap.indirectObjectGender ? ["indirectObjectGender"] : []),
              ],
            },
          ]
        : []),
    ];
    for (const g of roleGroups) {
      const pts = g.nodeKeys.map((k) => pos(k));
      const minXpct = Math.min(...pts.map((p) => p.x));
      const maxXpct = Math.max(...pts.map((p) => p.x));
      const minYpct = Math.min(...pts.map((p) => p.y));
      const maxYpct = Math.max(...pts.map((p) => p.y));
      const rx = Math.max(0, px(minXpct, svgSize.w) - PIX_PAD_H);
      const ry = Math.max(0, px(minYpct, svgSize.h) - PIX_PAD_TOP);
      groupRects.push({
        label: g.label,
        color: g.color,
        nodeKeys: g.nodeKeys,
        x: rx,
        y: ry,
        width: Math.min(svgSize.w, px(maxXpct, svgSize.w) + PIX_PAD_H) - rx,
        height: Math.min(svgSize.h, px(maxYpct, svgSize.h) + PIX_PAD_BOT) - ry,
      });
    }
  }

  return (
    <Box
      sx={{
        position: position ? "fixed" : "relative",
        ...(position && { left: `${position.x}px`, top: `${position.y}px` }),
        zIndex: position ? 50 : "auto",
      }}
    >
      <Paper
        elevation={0}
        onPointerDown={(e) => {
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
          cursor:
            borderDragRef.current && position
              ? "grabbing"
              : position
                ? "default"
                : undefined,
        }}
      >
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
                  <VerbTypeahead onSelect={(c) => handleConceptSelect(c, "verb")} />
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
                <Box
                  component="svg"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
                >
                  {groupRects.map((g) => (
                    <rect
                      key={g.label}
                      x={g.x}
                      y={g.y}
                      width={g.width}
                      height={g.height}
                      rx="4"
                      ry="4"
                      fill="rgba(0,0,0,0.001)"
                      stroke={g.color}
                      strokeWidth="1"
                      strokeOpacity="0.45"
                      strokeDasharray="8 5"
                      style={{
                        cursor:
                          draggingKey === "__group__" ? "grabbing" : "grab",
                      }}
                      onPointerDown={(e) => startGroupDrag(e, g.nodeKeys)}
                      onPointerMove={moveDrag}
                      onPointerUp={() => endDrag()}
                      onPointerCancel={() => endDrag()}
                    />
                  ))}
                  {edges.map((edge, i) => (
                    <line
                      key={i}
                      x1={px(edge.from.x, svgSize.w)}
                      y1={px(edge.from.y, svgSize.h)}
                      x2={px(edge.to.x, svgSize.w)}
                      y2={px(edge.to.y, svgSize.h)}
                      stroke={edge.color}
                      strokeWidth="1"
                      strokeOpacity="0.25"
                      strokeDasharray="4 3"
                      style={{ pointerEvents: "none" }}
                    />
                  ))}
                </Box>

                {renderedSlots.map((slot, idx) => (
                  <Box
                    key={slot.key}
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
                      emptyContent={
                        slot.key === "verb" &&
                        activeSlot === "verb" &&
                        !selection.verb ? (
                          <VerbTypeahead
                            onSelect={(c) => handleConceptSelect(c, "verb")}
                          />
                        ) : slot.key === "subject" &&
                          activeSlot === "subject" &&
                          !selection.subject ? (
                          <SubjectTypeahead
                            onSelect={(c) => handleConceptSelect(c, "subject")}
                          />
                        ) : slot.key === "subjectAdjective" &&
                          activeSlot === "subjectAdjective" &&
                          !selection.subjectAdjective ? (
                          <AdjectiveTypeahead
                            onSelect={(c) =>
                              handleConceptSelect(c, "subjectAdjective")
                            }
                          />
                        ) : slot.key === "subjectAdjective2" &&
                          activeSlot === "subjectAdjective2" &&
                          !selection.subjectAdjective2 ? (
                          <AdjectiveTypeahead
                            onSelect={(c) =>
                              handleConceptSelect(c, "subjectAdjective2")
                            }
                          />
                        ) : slot.key === "directObject" &&
                          activeSlot === "directObject" &&
                          !selection.directObject ? (
                          <DirectObjectTypeahead
                            onSelect={(c) => handleConceptSelect(c, "directObject")}
                          />
                        ) : slot.key === "indirectObject" &&
                          activeSlot === "indirectObject" &&
                          !selection.indirectObject ? (
                          <IndirectObjectTypeahead
                            onSelect={(c) =>
                              handleConceptSelect(c, "indirectObject")
                            }
                          />
                        ) : undefined
                      }
                    />
                  </Box>
                ))}

                {shownMap.subjectNumber && (
                  <Box
                    {...makeDragProps(NUMBER_TOGGLE_KEY("subject"), () =>
                      handleToggleNumber("subject"),
                    )}
                  >
                    <NumberToggleBox
                      value={selection.subjectNumber ?? "singular"}
                    />
                  </Box>
                )}
                {shownMap.subjectGender && (
                  <Box
                    {...makeDragProps(GENDER_TOGGLE_KEY("subject"), () =>
                      handleToggleGender("subject"),
                    )}
                  >
                    <GenderToggleBox
                      value={selection.subjectGender ?? "masc"}
                    />
                  </Box>
                )}
                {shownMap.directObjectNumber && (
                  <Box
                    {...makeDragProps(NUMBER_TOGGLE_KEY("directObject"), () =>
                      handleToggleNumber("directObject"),
                    )}
                  >
                    <NumberToggleBox
                      value={selection.directObjectNumber ?? "singular"}
                    />
                  </Box>
                )}
                {shownMap.directObjectGender && (
                  <Box
                    {...makeDragProps(GENDER_TOGGLE_KEY("directObject"), () =>
                      handleToggleGender("directObject"),
                    )}
                  >
                    <GenderToggleBox
                      value={selection.directObjectGender ?? "masc"}
                    />
                  </Box>
                )}
                {shownMap.indirectObjectNumber && (
                  <Box
                    {...makeDragProps(NUMBER_TOGGLE_KEY("indirectObject"), () =>
                      handleToggleNumber("indirectObject"),
                    )}
                  >
                    <NumberToggleBox
                      value={selection.indirectObjectNumber ?? "singular"}
                    />
                  </Box>
                )}
                {shownMap.indirectObjectGender && (
                  <Box
                    {...makeDragProps(GENDER_TOGGLE_KEY("indirectObject"), () =>
                      handleToggleGender("indirectObject"),
                    )}
                  >
                    <GenderToggleBox
                      value={selection.indirectObjectGender ?? "masc"}
                    />
                  </Box>
                )}
                {shownMap.verbNegative && (
                  <Box {...makeDragProps("verbNegative", handleToggleNegative)}>
                    <NegativeToggleBox value={selection.verbNegative ?? false} />
                  </Box>
                )}
              </Box>

              {/* Resize strip */}
              <Box
                onPointerDown={(e) => {
                  e.preventDefault();
                  const startY = e.clientY;
                  const startH = graphHeight;
                  let currentH = startH;
                  const onMove = (ev: PointerEvent) => {
                    currentH = Math.max(MIN_GRAPH_HEIGHT, startH + (ev.clientY - startY));
                    setGraphHeight(currentH);
                  };
                  const onUp = () => {
                    localStorage.setItem("signi:graphHeight", String(Math.round(currentH)));
                    window.removeEventListener("pointermove", onMove);
                    window.removeEventListener("pointerup", onUp);
                    window.removeEventListener("pointercancel", onUp);
                  };
                  window.addEventListener("pointermove", onMove);
                  window.addEventListener("pointerup", onUp);
                  window.addEventListener("pointercancel", onUp);
                }}
                sx={{
                  height: 6,
                  cursor: "ns-resize",
                  touchAction: "none",
                  borderTop: "1px solid",
                  borderColor: "divider",
                  opacity: 0.4,
                  transition: "opacity 0.15s",
                  "&:hover": { opacity: 1, borderColor: "primary.main" },
                }}
              />
            </>
          )}
        </Box>
        {/* Sidebar resize handle */}
        <Box
          onPointerDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startW = sidebarWidth;
            let currentW = startW;
            const onMove = (ev: PointerEvent) => {
              currentW = Math.max(80, Math.min(400, startW - (ev.clientX - startX)));
              setSidebarWidth(currentW);
            };
            const onUp = () => {
              localStorage.setItem("signi:phraseBuilderSidebarWidth", String(Math.round(currentW)));
              window.removeEventListener("pointermove", onMove);
              window.removeEventListener("pointerup", onUp);
              window.removeEventListener("pointercancel", onUp);
            };
            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
            window.addEventListener("pointercancel", onUp);
          }}
          sx={{
            width: 6,
            flexShrink: 0,
            cursor: "ew-resize",
            touchAction: "none",
            borderLeft: "2px solid",
            borderColor: "divider",
            bgcolor: "divider",
            opacity: 0.6,
            transition: "opacity 0.15s, background-color 0.15s",
            "&:hover": { opacity: 1, bgcolor: "primary.main", borderColor: "primary.main" },
          }}
        />
        <Box
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            borderLeft: "1px solid",
            borderColor: "divider",
            pl: 1.5,
            maxHeight: graphHeight,
            overflowY: "auto",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "text.secondary",
              mb: 1,
              display: "block",
            }}
          >
            {activeSlotConfig ? activeSlotConfig.label : "Words"}
          </Typography>
          {activeSlotConfig ? (
            activeSlotConfig.roles.map((role) => (
              <ConceptPalette
                key={role}
                role={role}
                onSelect={(c) => handleConceptSelect(c, activeSlot as SlotKey)}
                selectedId={selection[activeSlot as SlotKey]?.id}
              />
            ))
          ) : (
            <>
              <Typography
                color="text.secondary"
                sx={{ fontSize: "0.72rem", fontStyle: "italic", mb: 1 }}
              >
                Click a slot to filter.
              </Typography>
              <Divider sx={{ my: 1 }} />
              {visibleSlots.map((slot) =>
                slot.roles.map((role) => (
                  <ConceptPalette
                    key={`${slot.key}-${role}`}
                    role={role}
                    onSelect={(c) => {
                      handleSlotClick(slot.key);
                      handleConceptSelect(c, slot.key);
                    }}
                    selectedId={selection[slot.key]?.id}
                  />
                )),
              )}
            </>
          )}
        </Box>
      </Box>
    </Paper>
    </Box>
  );
}
