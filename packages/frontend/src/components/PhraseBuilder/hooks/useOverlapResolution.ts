import React, { useLayoutEffect, useRef } from "react";
import type { GroupRect } from "../graph.ts";
import {
  resolveGroupOverlaps,
  BOTTOM_MARGIN,
  RANK_DRAGGED,
  RANK_FREE,
  RANK_GROWN,
  RANK_YIELDING,
} from "../overlap.ts";
import { MIN_GRAPH_HEIGHT } from "../slots.ts";
import type { DragState, Positions } from "./useDrag.ts";

interface UseOverlapResolutionArgs {
  compact: boolean;
  groupRects: GroupRect[];
  pos: (key: string) => { x: number; y: number };
  graphSize: { w: number; h: number };
  graphHeight: number;
  setPositions: React.Dispatch<React.SetStateAction<Positions>>;
  setGraphHeight: (h: number) => void;
  dragRef: React.RefObject<DragState | null>;
  // From useHeightRebase: set on the commit that sees a new height before the rebased
  // positions land. Read and cleared here, so this hook must be called after that one.
  positionsStaleRef: React.MutableRefObject<boolean>;
  // Labels of the boxes that give way to every other, however they appeared: rings that are there
  // only for a moment (an owner's empty word picker, gone once the owner is named or pointed to),
  // which must not leave the rings they met shoved out of place.
  yielding?: ReadonlySet<string>;
}

// Rings never overlap. A constituent's footprint grows with what orbits it, so revealing a
// satellite, adding an adjective or expanding a group all grow it — potentially straight over a
// neighbour. After every commit, measure the
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
export function useOverlapResolution({
  compact,
  groupRects,
  pos,
  graphSize,
  graphHeight,
  setPositions,
  setGraphHeight,
  dragRef,
  positionsStaleRef,
  yielding,
}: UseOverlapResolutionArgs) {
  const prevGroupSizesRef = useRef<Map<
    string,
    { w: number; h: number }
  > | null>(null);
  // The last geometry this effect actually resolved against. It runs after *every* commit
  // (no deps) so it can track a box dragged around, but that also means a commit driven by
  // something with no bearing on the layout — a parent re-render, a sibling's link line, or
  // React StrictMode's extra invocation — re-runs it against unchanged geometry. Re-resolving
  // there is not just wasted work: the rank heuristic below reads `prevGroupSizesRef`, whose
  // "just grew" signal is a one-commit pulse, so a redundant pass sees it already cleared and
  // resolves the same overlap a *different* way, writing new positions that trigger the next
  // redundant pass — an unbounded bump loop (Maximum update depth exceeded). Skipping when the
  // geometry is byte-for-byte what we last resolved keeps every real trigger (a drag, a grown
  // box, a resize) while dropping the passenger re-runs. See e2e/manner-possessor-crash.spec.ts.
  const lastResolvedRef = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (compact || groupRects.length === 0) return;
    // The rebase that follows a height change re-renders, so nothing is lost by waiting
    // for it — and measuring before it would size the canvas from stretched footprints,
    // which feeds its own next measurement and ratchets the canvas taller without end.
    if (positionsStaleRef.current) {
      positionsStaleRef.current = false;
      return;
    }
    const sizes = new Map(groupRects.map((g) => [g.label, { w: g.width, h: g.height }] as const));
    // A drag has to re-resolve on every pointer move (and size the canvas to the dragged box),
    // so it never takes the skip; outside a drag, bail when nothing that feeds the resolution
    // has moved since we last ran it.
    const dragging = Boolean(dragRef.current?.keys);
    if (!dragging) {
      const signature = JSON.stringify([
        groupRects.map((g) => [g.label, g.nodeKeys, pos(g.mainKey)]),
        [...sizes],
        graphSize,
      ]);
      if (signature === lastResolvedRef.current) return;
      lastResolvedRef.current = signature;
    } else {
      lastResolvedRef.current = null;
    }
    const before = prevGroupSizesRef.current;
    prevGroupSizesRef.current = sizes;

    const dragKeys = dragRef.current?.keys;
    const rankOf = (g: GroupRect) => {
      if (dragKeys?.some((k) => g.nodeKeys.includes(k))) return RANK_DRAGGED;
      if (yielding?.has(g.label)) return RANK_YIELDING;
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
      const bottom = Math.max(
        ...groupRects.map((g) => {
          const settled = separated?.positions[g.mainKey]?.y ?? pos(g.mainKey).y;
          const shift = ((settled - pos(g.mainKey).y) / 100) * graphSize.h;
          return g.y + g.height + shift;
        }),
      );
      const fitted = Math.max(
        MIN_GRAPH_HEIGHT,
        Math.ceil(bottom + BOTTOM_MARGIN),
      );
      // The height rebase (useHeightRebase) holds every node's pixel offset, so the room only
      // ever appears or disappears at the bottom and nothing else shifts. Not persisted: this
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
}
