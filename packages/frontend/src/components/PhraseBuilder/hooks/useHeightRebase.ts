import React, { useLayoutEffect, useRef } from "react";
import { rescaleYForHeight } from "../layout.ts";
import type { DragState, Positions } from "./useDrag.ts";

interface UseHeightRebaseArgs {
  graphHeight: number;
  setPositions: React.Dispatch<React.SetStateAction<Positions>>;
  dragRef: React.RefObject<DragState | null>;
}

// Resizing the container must not move the content vertically. Node y's are % of the
// canvas, so a height change alone would slide them all; rebase them onto the new height
// to hold each node's pixel offset from the canvas top. Runs before paint, so the nodes
// never render at the un-rebased position — the resized edge just yields empty space.
//
// Returns `positionsStaleRef`: set for the one commit that sees a new height but the
// positions the old one was laid out against — the rebase only lands on the render after.
// Any footprint measured in between reads too tall, so whoever measures them sits that
// commit out (and clears the flag). Layout effects run in call order, so call this hook
// before any effect that reads the flag.
export function useHeightRebase({
  graphHeight,
  setPositions,
  dragRef,
}: UseHeightRebaseArgs) {
  const prevGraphHeightRef = useRef(graphHeight);
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
    // setPositions and dragRef are stable identities, so only a height change re-runs this.
  }, [graphHeight, setPositions, dragRef]);
  return positionsStaleRef;
}
