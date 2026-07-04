import React, { useLayoutEffect, useRef, useState } from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";
import {
  COMPLEMENT_TYPES,
  type Concept,
  type ComplementType,
  type PathSpecifier,
} from "@signi/shared";
import ConceptPalette from "../ConceptPalette.tsx";
import { VerbTypeahead } from "./VerbTypeahead.tsx";
import { SlotBox, type SatelliteIcon } from "./Boxes.tsx";
import {
  GenderSlot,
  NumberSlot,
  PhraseSelection,
  SlotKey,
} from "./interfaces.ts";
import {
  ALL_SLOTS,
  COMPLEMENT_KEY_SET,
  SATELLITE_SLOT_KEYS,
  getActiveSlots,
  DEFAULT_POSITIONS,
  GRAPH_HEIGHT,
  MIN_GRAPH_HEIGHT,
} from "./slots.ts";
import { applyConceptSelect, applyClear } from "./phraseReducers.ts";
import { buildSatellites, type Satellite } from "./satellites.tsx";
import { buildGraph } from "./graph.ts";
import { type PhraseRenderContext } from "./phraseRender.tsx";
import { NounPhraseBuilder } from "./NounPhraseBuilder.tsx";
import { VerbPhraseBuilder } from "./VerbPhraseBuilder.tsx";
import { PhraseGraphLayer } from "./PhraseGraphLayer.tsx";
import { ComplementRemoveButtons } from "./ComplementRemoveButtons.tsx";

interface PhraseBuilderProps {
  selection: PhraseSelection;
  onPhraseUpdate: (updater: (prev: PhraseSelection) => PhraseSelection) => void;
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
}: PhraseBuilderProps) {
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>("verb");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
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
  );
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
    } else if (
      slot === "subjectAdjective" ||
      slot === "directObjectAdjective" ||
      slot === "indirectObjectAdjective"
    ) {
      // Reveal & focus the chained second adjective.
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

  // Set the route complement's path relation (through / under / over / …).
  function handleSelectSpecifier(spec: PathSpecifier) {
    onPhraseUpdate((prev) => ({ ...prev, routeSpecifier: spec }));
  }

  const { satellites, shownMap } = buildSatellites(selection, revealed);

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
      (satelliteIconsByParent[sat.parent] ??= []).push(iconEntry);
    }
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

  function pos(key: string) {
    return positions[key] ?? DEFAULT_POSITIONS[key];
  }

  const { edges, groupRects, groupEdges } = buildGraph({
    hasVerb,
    renderedSlots,
    visibleSlots,
    shownMap,
    pos,
    svgSize,
  });

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
    makeDragProps,
    slotEls,
    handleSlotClick,
    handleConceptSelect,
    handleClear,
    handleToggleNumber,
    handleToggleGender,
    handleToggleNegative,
    handleSelectSpecifier,
  };

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
                  <PhraseGraphLayer
                    svgSize={svgSize}
                    groupRects={groupRects}
                    groupEdges={groupEdges}
                    edges={edges}
                    draggingKey={draggingKey}
                    onGroupDragStart={startGroupDrag}
                    onDragMove={moveDrag}
                    onDragEnd={() => endDrag()}
                  />

                  {/* Remove-complement "x" on each complement dotted box's corner */}
                  <ComplementRemoveButtons
                    groupRects={groupRects}
                    onRemove={handleRemoveComplement}
                  />

                  {/* Every constituent paints onto this shared canvas. The
                      builders self-filter, so mounting one per possible noun /
                      the verb phrase unconditionally is safe — inactive slots
                      and toggles render nothing. */}
                  <NounPhraseBuilder which="subject" ctx={ctx} />
                  <VerbPhraseBuilder ctx={ctx} />
                  <NounPhraseBuilder which="directObject" ctx={ctx} />
                  <NounPhraseBuilder which="indirectObject" ctx={ctx} />
                  {COMPLEMENT_TYPES.map((type) => (
                    <NounPhraseBuilder key={type} which={type} ctx={ctx} />
                  ))}
                </Box>

                {/* Resize strip */}
                <Box
                  onPointerDown={(e) => {
                    e.preventDefault();
                    const startY = e.clientY;
                    const startH = graphHeight;
                    let currentH = startH;
                    const onMove = (ev: PointerEvent) => {
                      currentH = Math.max(
                        MIN_GRAPH_HEIGHT,
                        startH + (ev.clientY - startY),
                      );
                      setGraphHeight(currentH);
                    };
                    const onUp = () => {
                      localStorage.setItem(
                        "signi:graphHeight",
                        String(Math.round(currentH)),
                      );
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
                currentW = Math.max(
                  80,
                  Math.min(400, startW - (ev.clientX - startX)),
                );
                setSidebarWidth(currentW);
              };
              const onUp = () => {
                localStorage.setItem(
                  "signi:phraseBuilderSidebarWidth",
                  String(Math.round(currentW)),
                );
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
              "&:hover": {
                opacity: 1,
                bgcolor: "primary.main",
                borderColor: "primary.main",
              },
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
                  onSelect={(c) =>
                    handleConceptSelect(c, activeSlot as SlotKey)
                  }
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
