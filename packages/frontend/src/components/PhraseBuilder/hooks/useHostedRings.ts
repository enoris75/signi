import { useCallback, useRef, useState } from "react";
import { mergeHostedRings, type HostedRing, type HostedRingGroup } from "../conjunctChain.ts";

// The rings hosted on a canvas — conjuncts', owners', an instrument's — as each one's builder reports
// drawing them, keyed by their node keys there (see conjunctKey; an owner's is its address).
// `reportRings` takes one builder's report, under the key its host knows it by: every ring it drew, or
// null once it is gone.
//
// The reports are set as whole values worked out here, never as updaters: an updater React replays
// (rebasing a queue a skipped update left behind) would build a fresh object each time, and a fresh
// object re-renders every hosted ring, which reports again — an unbounded loop.
export function useHostedRings(): {
  hostedRings: Record<string, HostedRing>;
  reportRings: (hostKey: string, group: HostedRingGroup | null) => void;
} {
  const [hostedRings, setHostedRings] = useState<Record<string, HostedRing>>({});
  const hostedRingsRef = useRef(hostedRings);
  // The keys each builder reported last, so the rings it stops drawing leave with its next report.
  const ownedRef = useRef(new Map<string, readonly string[]>());
  const reportRings = useCallback((hostKey: string, group: HostedRingGroup | null) => {
    const previous = ownedRef.current.get(hostKey) ?? [];
    if (group) ownedRef.current.set(hostKey, Object.keys(group));
    else ownedRef.current.delete(hostKey);
    const next = mergeHostedRings(hostedRingsRef.current, previous, group);
    if (next === hostedRingsRef.current) return;
    hostedRingsRef.current = next;
    setHostedRings(next);
  }, []);
  return { hostedRings, reportRings };
}
