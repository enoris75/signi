import { useMemo } from "react";
import { computeCompactLayout, type PositionMap } from "../layout.ts";

// Compact-view layout, derived (not stored) each render: pack the core words into centred rows and
// size the canvas to just wrap them. Because it's recomputed from the current width, it never goes
// stale on a resize, and the stored full-view positions/height stay pristine for when compact turns
// back off. The packing keeps clear of `corner` — the period's controls, which reserve no room of
// their own. Null while not `enabled`.
export function useCompactLayout({
  enabled,
  keys,
  width,
  corner,
  cell,
}: {
  enabled: boolean;
  // The keys to pack, in order (see compactPacking).
  keys: string[];
  width: number;
  corner: { w: number; h: number };
  cell: { halfW: number; halfH: number };
}): { positions: PositionMap; height: number } | null {
  return useMemo(
    () => (enabled ? computeCompactLayout(keys, width, corner, cell) : null),
    // The keys and the cell are fresh every render; what they spell is what the packing depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, keys.join(), width, corner, cell.halfW, cell.halfH],
  );
}
