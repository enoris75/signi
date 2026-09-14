import { useCallback, useRef, useState } from "react";
import { mergeHostedRing, type HostedRing } from "../conjunctChain.ts";

// The rings hosted on a canvas — conjuncts' and owners' — as each one's builder reports drawing it,
// keyed by its node key there (see conjunctKey; an owner's is its address). `reportRing` takes a
// builder's report: its ring, or null once it is gone.
//
// The reports are set as whole values worked out here, never as updaters: an updater React replays
// (rebasing a queue a skipped update left behind) would build a fresh object each time, and a fresh
// object re-renders every hosted ring, which reports again — an unbounded loop.
export function useHostedRings(): {
  hostedRings: Record<string, HostedRing>;
  reportRing: (key: string, ring: HostedRing | null) => void;
} {
  const [hostedRings, setHostedRings] = useState<Record<string, HostedRing>>({});
  const hostedRingsRef = useRef(hostedRings);
  const reportRing = useCallback((key: string, ring: HostedRing | null) => {
    const next = mergeHostedRing(hostedRingsRef.current, key, ring);
    if (next === hostedRingsRef.current) return;
    hostedRingsRef.current = next;
    setHostedRings(next);
  }, []);
  return { hostedRings, reportRing };
}
