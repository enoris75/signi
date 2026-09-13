import { useLayoutEffect, useRef, useState } from "react";
import { NounKey } from "../interfaces.ts";
import { ALL_SLOTS, COLLAPSIBLE_GROUPS, MUI_COLOR_HEX } from "../slots.ts";
import { sameRelConnectors, type RelConnector } from "../measure.ts";

interface UsePanelConnectorsArgs {
  openPossessors: NounKey[];
  openConjuncts: NounKey[];
  collapsedGroups: Record<string, boolean>;
}

// The connector lines from a noun box down to its docked possessor / conjunct panels.
//
// Each runs dot-to-dot: from the control on the noun's dotted-box perimeter (start) to the
// receiving dot on the panel's top edge (end). The possessor control and the "Coordinate"
// control register in their `*ControlEls` map, the panels' dots in their `*DotEls` map.
// Both ends are measured relative to `rootRef` — the builder's outermost positioned Box —
// so the SVG overlay can span the gap down to the panels, which live below the canvas.
// Guarded so it settles; runs every commit, so it tracks a noun box dragged around.
export function usePanelConnectors({
  openPossessors,
  openConjuncts,
  collapsedGroups,
}: UsePanelConnectorsArgs) {
  const rootRef = useRef<HTMLDivElement>(null);
  const possessorControlEls = useRef<Map<string, HTMLElement>>(new Map());
  const possessorDotEls = useRef<Map<string, HTMLElement>>(new Map());
  const conjunctControlEls = useRef<Map<string, HTMLElement>>(new Map());
  const conjunctDotEls = useRef<Map<string, HTMLElement>>(new Map());
  const [relConnectors, setRelConnectors] = useState<RelConnector[]>([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const next: RelConnector[] = [];
    // Measure one control→panel-dot connector. `prefix` keeps keys distinct so a noun
    // could carry several such connectors without their ids colliding.
    const measure = (
      which: string,
      controlEl: HTMLElement | undefined,
      dotEl: HTMLElement | undefined,
      prefix: string,
    ) => {
      // Skip the connector while the noun's group box is collapsed.
      const label = COLLAPSIBLE_GROUPS.find((g) => g.mainKey === which)?.label;
      if (label && collapsedGroups[label]) return;
      if (!controlEl || !dotEl) return;
      const c = controlEl.getBoundingClientRect();
      const d = dotEl.getBoundingClientRect();
      const x1 = c.left + c.width / 2 - rootRect.left;
      const y1 = c.top + c.height / 2 - rootRect.top;
      const x2 = d.left + d.width / 2 - rootRect.left;
      const y2 = d.top + d.height / 2 - rootRect.top;
      const color =
        MUI_COLOR_HEX[
          ALL_SLOTS.find((s) => s.key === which)?.color ?? "primary"
        ];
      next.push({ which: `${prefix}:${which}`, x1, y1, x2, y2, color });
    };
    for (const which of openPossessors)
      measure(
        which,
        possessorControlEls.current.get(which),
        possessorDotEls.current.get(which),
        "poss",
      );
    for (const which of openConjuncts)
      measure(
        which,
        conjunctControlEls.current.get(which),
        conjunctDotEls.current.get(which),
        "conj",
      );
    setRelConnectors((prev) => (sameRelConnectors(prev, next) ? prev : next));
  });

  return {
    rootRef,
    possessorControlEls,
    possessorDotEls,
    conjunctControlEls,
    conjunctDotEls,
    relConnectors,
  };
}
