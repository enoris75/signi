import { useLayoutEffect, useRef } from "react";
import { sameHostedRings, type HostedRingGroup } from "../conjunctChain.ts";
import { perimeterControlKey } from "../ringSpecs.ts";
import type { GroupRect } from "../graph.ts";
import type { Pt } from "../ringLayout.ts";
import type { RingHost } from "../ringHost.ts";

// A hosted ring's builder tells the canvas it is hosted on about the rings it just drew (`ownRings`):
// how far each reaches, and where its link ports and its possessor control sit on the first of them,
// relative to that ring's centre. Each goes by the key the host knows it by (`RingHost.keyOf`); a
// host that gives no `keyOf` knows its one ring by its own key. Does nothing for a builder with no
// `ringHost`.
//
// Only a group that really changed is reported: this runs after every commit, and even a report the
// host would ignore costs it a render (React's eager bail-out can't always see the no-op), which
// re-renders this builder, which reports again — an unbounded loop.
//
// It reports the group gone too, once it is — or once it answers to another key (a conjunct before it
// was removed). A report is bound to the key it was made under.
export function useReportOwnRing(
  ringHost: RingHost | undefined,
  ownRings: readonly GroupRect[],
  controlPos: Readonly<Record<string, Pt>>,
): void {
  const reported = useRef<HostedRingGroup | undefined>(undefined);
  useLayoutEffect(() => {
    if (!ringHost || ownRings.length === 0) return;
    const group: HostedRingGroup = {};
    ownRings.forEach((own, i) => {
      const ports: Record<string, Pt> = {};
      // The ports and the possessor control ride the first ring: the phrase's head.
      if (i === 0)
        for (const key of [...ringHost.ports.map((p) => p.key), perimeterControlKey("possessor", "subject")]) {
          const at = controlPos[key];
          if (at) ports[key] = { x: at.x - own.center.x, y: at.y - own.center.y };
        }
      const key = ringHost.keyOf?.(own.mainKey) ?? ringHost.key;
      group[key] = { rIn: own.rIn, orbit: own.orbit, rOut: own.rOut, ports };
    });
    if (sameHostedRings(reported.current, group)) return;
    reported.current = group;
    ringHost.onRings(group);
  });

  const hostKey = ringHost?.key;
  useLayoutEffect(() => {
    const onRings = ringHost?.onRings;
    return () => {
      reported.current = undefined;
      onRings?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostKey]);
}
