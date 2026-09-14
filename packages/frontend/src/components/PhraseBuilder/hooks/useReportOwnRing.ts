import { useLayoutEffect, useRef } from "react";
import { sameHostedRing, type HostedRing } from "../conjunctChain.ts";
import { perimeterControlKey } from "../ringSpecs.ts";
import type { GroupRect } from "../graph.ts";
import type { Pt } from "../ringLayout.ts";
import type { RingHost } from "../ringHost.ts";

// A hosted ring's builder tells the canvas it is hosted on about the ring it just drew (`ownRing`):
// how far it reaches, and where its link ports and its possessor control sit on it, relative to its
// centre. Does nothing for a builder with no `ringHost`.
//
// Only a ring that really changed is reported: this runs after every commit, and even a report the
// host would ignore costs it a render (React's eager bail-out can't always see the no-op), which
// re-renders this builder, which reports again — an unbounded loop.
//
// It reports the ring gone too, once it is — or once it answers to another key (a conjunct before it
// was removed). A report is bound to the key it was made under.
export function useReportOwnRing(
  ringHost: RingHost | undefined,
  ownRing: GroupRect | undefined,
  controlPos: Readonly<Record<string, Pt>>,
): void {
  const reportedRing = useRef<HostedRing | undefined>(undefined);
  useLayoutEffect(() => {
    if (!ringHost || !ownRing) return;
    const ports: Record<string, Pt> = {};
    for (const key of [...ringHost.ports.map((p) => p.key), perimeterControlKey("possessor", "subject")]) {
      const at = controlPos[key];
      if (at) ports[key] = { x: at.x - ownRing.center.x, y: at.y - ownRing.center.y };
    }
    const ring = { rIn: ownRing.rIn, orbit: ownRing.orbit, rOut: ownRing.rOut, ports };
    if (sameHostedRing(reportedRing.current, ring)) return;
    reportedRing.current = ring;
    ringHost.onRing(ring);
  });

  const hostKey = ringHost?.key;
  useLayoutEffect(() => {
    const onRing = ringHost?.onRing;
    return () => {
      reportedRing.current = undefined;
      onRing?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostKey]);
}
