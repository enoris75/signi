import React, { useRef, useState } from "react";
import { DEFAULT_POSITIONS } from "../slots.ts";

export type DragState = {
  keys: string[];
  startX: number;
  startY: number;
  origPositions: Record<string, { x: number; y: number }>;
  moved: boolean;
};

export type Positions = Record<string, { x: number; y: number }>;

interface UseDragArgs {
  positions: Positions;
  setPositions: React.Dispatch<React.SetStateAction<Positions>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  // The boxes are painted from a derived layout (compact view), not from `positions`: a press
  // still activates a box, but a drag moves nothing — it would shift a stored position the
  // canvas isn't showing.
  frozen?: boolean;
}

// Node-drag machinery for the phrase canvas: individual boxes (makeDragProps) and whole
// dotted groups (makeGroupDragProps) are dragged by pointer, writing back % positions.
// `dragRef` and `draggingKey` are also read by the owning component's layout effects (the
// height rebase and the overlap resolver both need to know what's being dragged).
export function useDrag({ positions, setPositions, containerRef, frozen = false }: UseDragArgs) {
  const dragRef = useRef<DragState | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

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
    if (frozen) return;
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

  // `at` is where the box is painted, when that isn't its stored position (compact view, or a
  // satellite seated on its constituent's orbit). `moveKey` is the node a drag actually moves: a
  // satellite's is its constituent's word, so pressing a disc drags the whole ring.
  function makeDragProps(
    key: string,
    onActivate: () => void,
    at: { x: number; y: number } = positions[key] ?? DEFAULT_POSITIONS[key],
    moveKey: string = key,
  ) {
    const isDragging = draggingKey === moveKey;
    return {
      onPointerDown: (e: React.PointerEvent) => startDrag(e, moveKey),
      onPointerMove: moveDrag,
      onPointerUp: () => endDrag(onActivate),
      onPointerCancel: () => endDrag(),
      sx: {
        position: "absolute" as const,
        left: `${at.x}%`,
        top: `${at.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isDragging ? 10 : 1,
        cursor: frozen ? "pointer" : isDragging ? "grabbing" : "grab",
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

  return { dragRef, draggingKey, makeDragProps, makeGroupDragProps };
}
