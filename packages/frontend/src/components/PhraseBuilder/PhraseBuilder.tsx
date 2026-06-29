import React, { useLayoutEffect, useRef, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import type { Concept, GrammaticalRole, Transitivity } from "@signi/shared";
import { IndirectObjectTypeahead } from "./IndirectObjectTypeahead.tsx";
import { DirectObjectTypeahead } from "./DirectObjectTypeahead.tsx";
import { AdjectiveTypeahead } from "./AdjectiveTypeahead.tsx";
import { SubjectTypeahead } from "./SubjectTypeahead.tsx";
import { VerbTypeahead } from "./VerbTypeahead.tsx";
import { SlotBox, NumberToggleBox, GenderToggleBox } from "./Boxes.tsx";
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

export function getActiveSlots(
  transitivity?: Transitivity,
  subjectRole?: GrammaticalRole,
): SlotConfig[] {
  return ALL_SLOTS.filter((slot) => {
    if (slot.key === "directObject") return transitivity !== "intransitive";
    if (slot.key === "indirectObject") return transitivity === "ditransitive";
    if (slot.key === "subjectAdjective") return subjectRole === "noun";
    return true;
  });
}

interface PhraseBuilderProps {
  selection: PhraseSelection;
  activeSlot: SlotKey | null;
  onSlotClick: (slot: SlotKey) => void;
  onClear: (slot: SlotKey) => void;
  onToggleNumber: (which: NumberSlot) => void;
  onToggleGender: (which: GenderSlot) => void;
  onConceptSelect: (slot: SlotKey, concept: Concept) => void;
  sidebar?: React.ReactNode;
}

const NODE_POS: Record<SlotKey, { x: number; y: number }> = {
  subjectAdjective: { x: 12, y: 14 },
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
  activeSlot,
  onSlotClick,
  onClear,
  onToggleNumber,
  onToggleGender,
  onConceptSelect,
  sidebar,
}: PhraseBuilderProps) {
  const hasVerb = Boolean(selection.verb);
  const verbSlot = ALL_SLOTS.find((s) => s.key === "verb")!;
  const visibleSlots = getActiveSlots(
    selection.verb?.transitivity,
    selection.subject?.role,
  );

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
  const resizeRef = useRef<{ startY: number; startH: number } | null>(null);

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
    for (const slot of visibleSlots) {
      if (slot.key === "verb") continue;
      const from =
        slot.key === "subjectAdjective" ? pos("subject") : pos("verb");
      edges.push({ from, to: pos(slot.key), color: MUI_COLOR_HEX[slot.color] });
    }
    if (showSubjectNumber)
      edges.push({
        from: pos("subject"),
        to: pos("subjectNumber"),
        color: "#888",
      });
    if (showSubjectGender)
      edges.push({
        from: pos("subject"),
        to: pos("subjectGender"),
        color: "#888",
      });
    if (showDirectObjNumber)
      edges.push({
        from: pos("directObject"),
        to: pos("directObjectNumber"),
        color: MUI_COLOR_HEX.success,
      });
    if (showDirectObjGender)
      edges.push({
        from: pos("directObject"),
        to: pos("directObjectGender"),
        color: MUI_COLOR_HEX.success,
      });
    if (showIndirectObjNumber)
      edges.push({
        from: pos("indirectObject"),
        to: pos("indirectObjectNumber"),
        color: MUI_COLOR_HEX.warning,
      });
    if (showIndirectObjGender)
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
          ...(visibleSlots.some((s) => s.key === "subjectAdjective")
            ? ["subjectAdjective"]
            : []),
          "subject",
          ...(showSubjectNumber ? ["subjectNumber"] : []),
          ...(showSubjectGender ? ["subjectGender"] : []),
        ],
      },
      {
        label: "Verb Phrase",
        color: MUI_COLOR_HEX.secondary,
        nodeKeys: [
          "verb",
          ...(visibleSlots.some((s) => s.key === "modifier")
            ? ["modifier"]
            : []),
        ],
      },
      ...(visibleSlots.some((s) => s.key === "directObject")
        ? [
            {
              label: "Direct Object",
              color: MUI_COLOR_HEX.success,
              nodeKeys: [
                "directObject",
                ...(showDirectObjNumber ? ["directObjectNumber"] : []),
                ...(showDirectObjGender ? ["directObjectGender"] : []),
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
                ...(showIndirectObjNumber ? ["indirectObjectNumber"] : []),
                ...(showIndirectObjGender ? ["indirectObjectGender"] : []),
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
    <Paper
      elevation={0}
      sx={{ p: 2, border: "1px solid", borderColor: "divider" }}
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
                onClear={() => onClear("verb")}
                emptyContent={
                  <VerbTypeahead onSelect={(c) => onConceptSelect("verb", c)} />
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

                {visibleSlots.map((slot, idx) => (
                  <Box
                    key={slot.key}
                    {...makeDragProps(slot.key, () => onSlotClick(slot.key))}
                    ref={(el: HTMLElement | null) => {
                      if (el) slotEls.current.set(slot.key, el);
                      else slotEls.current.delete(slot.key);
                    }}
                    tabIndex={0}
                    onFocus={() => onSlotClick(slot.key)}
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
                        (idx + dir + visibleSlots.length) % visibleSlots.length;
                      const nextKey = visibleSlots[nextIdx].key;
                      onSlotClick(nextKey);
                      slotEls.current.get(nextKey)?.focus();
                    }}
                  >
                    <SlotBox
                      slot={slot}
                      concept={selection[slot.key]}
                      isActive={activeSlot === slot.key}
                      onClear={() => onClear(slot.key)}
                      emptyContent={
                        slot.key === "verb" &&
                        activeSlot === "verb" &&
                        !selection.verb ? (
                          <VerbTypeahead
                            onSelect={(c) => onConceptSelect("verb", c)}
                          />
                        ) : slot.key === "subject" &&
                          activeSlot === "subject" &&
                          !selection.subject ? (
                          <SubjectTypeahead
                            onSelect={(c) => onConceptSelect("subject", c)}
                          />
                        ) : slot.key === "subjectAdjective" &&
                          activeSlot === "subjectAdjective" &&
                          !selection.subjectAdjective ? (
                          <AdjectiveTypeahead
                            onSelect={(c) =>
                              onConceptSelect("subjectAdjective", c)
                            }
                          />
                        ) : slot.key === "directObject" &&
                          activeSlot === "directObject" &&
                          !selection.directObject ? (
                          <DirectObjectTypeahead
                            onSelect={(c) => onConceptSelect("directObject", c)}
                          />
                        ) : slot.key === "indirectObject" &&
                          activeSlot === "indirectObject" &&
                          !selection.indirectObject ? (
                          <IndirectObjectTypeahead
                            onSelect={(c) =>
                              onConceptSelect("indirectObject", c)
                            }
                          />
                        ) : undefined
                      }
                    />
                  </Box>
                ))}

                {showSubjectNumber && (
                  <Box
                    {...makeDragProps(NUMBER_TOGGLE_KEY("subject"), () =>
                      onToggleNumber("subject"),
                    )}
                  >
                    <NumberToggleBox
                      value={selection.subjectNumber ?? "singular"}
                    />
                  </Box>
                )}
                {showSubjectGender && (
                  <Box
                    {...makeDragProps(GENDER_TOGGLE_KEY("subject"), () =>
                      onToggleGender("subject"),
                    )}
                  >
                    <GenderToggleBox
                      value={selection.subjectGender ?? "masc"}
                    />
                  </Box>
                )}
                {showDirectObjNumber && (
                  <Box
                    {...makeDragProps(NUMBER_TOGGLE_KEY("directObject"), () =>
                      onToggleNumber("directObject"),
                    )}
                  >
                    <NumberToggleBox
                      value={selection.directObjectNumber ?? "singular"}
                    />
                  </Box>
                )}
                {showDirectObjGender && (
                  <Box
                    {...makeDragProps(GENDER_TOGGLE_KEY("directObject"), () =>
                      onToggleGender("directObject"),
                    )}
                  >
                    <GenderToggleBox
                      value={selection.directObjectGender ?? "masc"}
                    />
                  </Box>
                )}
                {showIndirectObjNumber && (
                  <Box
                    {...makeDragProps(NUMBER_TOGGLE_KEY("indirectObject"), () =>
                      onToggleNumber("indirectObject"),
                    )}
                  >
                    <NumberToggleBox
                      value={selection.indirectObjectNumber ?? "singular"}
                    />
                  </Box>
                )}
                {showIndirectObjGender && (
                  <Box
                    {...makeDragProps(GENDER_TOGGLE_KEY("indirectObject"), () =>
                      onToggleGender("indirectObject"),
                    )}
                  >
                    <GenderToggleBox
                      value={selection.indirectObjectGender ?? "masc"}
                    />
                  </Box>
                )}
              </Box>

              {/* Resize strip */}
              <Box
                onPointerDown={(e) => {
                  (e.currentTarget as HTMLElement).setPointerCapture(
                    e.pointerId,
                  );
                  resizeRef.current = {
                    startY: e.clientY,
                    startH: graphHeight,
                  };
                }}
                onPointerMove={(e) => {
                  if (!resizeRef.current) return;
                  const dy = e.clientY - resizeRef.current.startY;
                  setGraphHeight(
                    Math.max(MIN_GRAPH_HEIGHT, resizeRef.current.startH + dy),
                  );
                }}
                onPointerUp={() => {
                  if (resizeRef.current)
                    localStorage.setItem(
                      "signi:graphHeight",
                      String(Math.round(graphHeight)),
                    );
                  resizeRef.current = null;
                }}
                onPointerCancel={() => {
                  resizeRef.current = null;
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
        {sidebar && (
          <Box
            sx={{
              width: 160,
              flexShrink: 0,
              borderLeft: "1px solid",
              borderColor: "divider",
              pl: 1.5,
              maxHeight: graphHeight,
              overflowY: "auto",
            }}
          >
            {sidebar}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
