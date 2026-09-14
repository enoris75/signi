import { useLayoutEffect, type Dispatch, type SetStateAction } from "react";
import type { NounKey } from "../interfaces.ts";
import type { CanvasSize, PositionMap } from "../layout.ts";
import type { OwnerSpot } from "../ownerChain.ts";
import { seedHostedPositions } from "../functions/seedHostedPositions.ts";

// Place each hosted ring on a canvas the first time it appears (see seedHostedPositions), growing
// the canvas when a ring would land past its bottom edge. Runs after every commit while `enabled`;
// a canvas whose rings are all placed does nothing.
export function useHostedRingPlacement({
  enabled,
  chains,
  owners,
  positions,
  groupRects,
  hostedRings,
  canvas,
  setPositions,
  setGraphHeight,
}: {
  // Off for a hosted ring's builder, whose one ring the canvas hosting it places.
  enabled: boolean;
  chains: readonly { which: NounKey; count: number }[];
  owners: readonly Pick<OwnerSpot, "address" | "possessedKey">[];
  positions: PositionMap;
  groupRects: readonly { mainKey: string; rOut: number }[];
  hostedRings: Readonly<Record<string, { rOut: number }>>;
  // The full-view canvas: its measured width and its stored height.
  canvas: CanvasSize;
  setPositions: Dispatch<SetStateAction<PositionMap>>;
  setGraphHeight: (height: number) => void;
}): void {
  useLayoutEffect(() => {
    if (!enabled || (chains.length === 0 && owners.length === 0)) return;
    const { seeds, bottom } = seedHostedPositions({ chains, owners, positions, groupRects, hostedRings, canvas });
    if (Object.keys(seeds).length === 0) return;
    setPositions((prev) => ({ ...prev, ...seeds }));
    // The height rebase that follows holds every stored position's pixel offset, seeds included.
    if (bottom > canvas.h) setGraphHeight(Math.ceil(bottom));
  });
}
