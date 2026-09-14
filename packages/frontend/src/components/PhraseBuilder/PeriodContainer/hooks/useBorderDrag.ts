import type React from "react";
import { useRef, useState } from "react";

type Point = { x: number; y: number };

// How far in from the card's edge a press still grabs its border, in pixels.
const BORDER_GRIP = 8;

interface UseBorderDragArgs {
  // May the card be torn off its place in the page flow at all?
  enabled: boolean;
  // Where the card has been dragged to, in viewport pixels; null while it sits in flow.
  position: Point | null;
  onPositionChange: (position: Point) => void;
}

// The border drag that floats a period card around the viewport. A press within BORDER_GRIP pixels
// of the card's edge captures the pointer, and every move reports the card's new position. Each move
// is measured from where the drag began, not from the last move, so the owner re-rendering the card
// at each report doesn't compound the travel. A card still in the page flow starts from the origin.
export function useBorderDrag({
  enabled,
  position,
  onPositionChange,
}: UseBorderDragArgs) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPos: Point;
  } | null>(null);
  // Mirrors dragRef for rendering: the card wears the grabbing cursor while this is set.
  const [dragging, setDragging] = useState(false);

  function onPointerDown(e: React.PointerEvent<HTMLElement>) {
    if (!enabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nearBorder =
      x < BORDER_GRIP ||
      x > rect.width - BORDER_GRIP ||
      y < BORDER_GRIP ||
      y > rect.height - BORDER_GRIP;
    if (!nearBorder) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: position ?? { x: 0, y: 0 },
    };
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    onPositionChange({
      x: drag.startPos.x + e.clientX - drag.startX,
      y: drag.startPos.y + e.clientY - drag.startY,
    });
  }

  function endDrag() {
    dragRef.current = null;
    setDragging(false);
  }

  return {
    dragging,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
