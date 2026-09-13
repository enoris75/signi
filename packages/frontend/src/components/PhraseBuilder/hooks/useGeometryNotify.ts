import { useLayoutEffect, useRef } from "react";
import type { BoxSizeMap } from "../measure.ts";
import type { Positions } from "./useDrag.ts";

interface CanvasGeometry {
  positions: Positions;
  boxSizes: BoxSizeMap;
  svgSize: { w: number; h: number };
  graphHeight: number;
  collapsedGroups: Record<string, boolean>;
  compact: boolean;
}

// Tell the workspace to re-measure its cross-container link lines whenever this
// container's canvas geometry changes — a box dragged, the canvas resized, a group
// collapsed. The workspace can't observe our internal drag state, so it would
// otherwise draw stale subordinate connectors.
//
// `notify` (the workspace's bumpGeom) forces a *workspace* re-render, which re-renders this
// container, which re-runs this effect — so it must fire only on a real geometry change,
// or it drives an unbounded bump→render→bump loop. Keying on the geometry state alone is
// not enough: those are fresh objects on every commit even when their values are identical
// (the overlap resolver writes a new positions object each pass; React StrictMode re-runs
// the layout effects that produce them). So compare the *serialized* geometry against the
// last value we actually reported, and bump only when it truly moved. An embedded possessor
// sub-builder mounting with content into a cramped canvas hit this loop hardest — the
// reopened panel's boxes settle over a few commits, each with a new positions identity but
// the same final values. See e2e/manner-possessor-crash.spec.ts.
export function useGeometryNotify(
  notify: (() => void) | undefined,
  { positions, boxSizes, svgSize, graphHeight, collapsedGroups, compact }: CanvasGeometry,
) {
  const lastGeometryRef = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (!notify) return;
    const signature = JSON.stringify([
      positions,
      boxSizes,
      svgSize,
      graphHeight,
      collapsedGroups,
      compact,
    ]);
    if (signature === lastGeometryRef.current) return;
    lastGeometryRef.current = signature;
    notify();
  }, [notify, positions, boxSizes, svgSize, graphHeight, collapsedGroups, compact]);
}
