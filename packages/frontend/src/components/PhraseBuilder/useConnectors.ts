import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  COORD_CONJUNCTION_LABEL,
  NounAddress,
  PhraseLink,
  isConditionalLink,
  isCoordinativeLink,
  isRelativeLink,
} from "./interfaces.ts";
import { ALL_SLOTS, MUI_COLOR_HEX } from "./slots.ts";

export const boxKey = (containerId: string, nounKey: NounAddress) =>
  `${containerId}:${nounKey}`;

// A drawn link line, in workspace pixels. Guarded by a half-pixel comparator so the
// measuring layout effect settles instead of looping on sub-pixel jitter. `kind` selects the
// stroke style: dashed faint line for a relative clause, solid arrowed line for a conditional.
export type Connector = {
  id: string;
  kind: "relative" | "conditional" | "coordinative";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  // The elbow label drawn on a clause-level connector's vertical run ("if" / "and" / "but" / …).
  label?: string;
};

function sameConnectors(a: Connector[], b: Connector[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const p = a[i];
    const q = b[i];
    if (p.id !== q.id || p.color !== q.color || p.kind !== q.kind || p.label !== q.label)
      return false;
    if (
      Math.abs(p.x1 - q.x1) > 0.5 ||
      Math.abs(p.y1 - q.y1) > 0.5 ||
      Math.abs(p.x2 - q.x2) > 0.5 ||
      Math.abs(p.y2 - q.y2) > 0.5
    )
      return false;
  }
  return true;
}

// Owns the link-connector geometry: the anchor/box ref maps a child container registers
// into, plus the layout effect that measures each link into workspace-relative pixels.
// Returns the refs for the workspace to wire into its container bindings and the computed
// connectors for the SVG overlay to draw.
export function useConnectors(links: PhraseLink[]) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const boxEls = useRef<Map<string, HTMLElement>>(new Map());
  // The anchor dots the link line snaps to: the source noun's relative-clause control
  // and the target noun's receiving dot, both pinned on their dotted-box perimeter.
  const sourceAnchorEls = useRef<Map<string, HTMLElement>>(new Map());
  const targetAnchorEls = useRef<Map<string, HTMLElement>>(new Map());
  // The border-control element per container — the endpoint the conditional connector runs
  // between (main clause's control → "if" clause's control).
  const borderAnchorEls = useRef<Map<string, HTMLElement>>(new Map());
  const [connectors, setConnectors] = useState<Connector[]>([]);
  // Bumped by a child container whenever it drags a box / resizes its canvas, so the
  // measuring effect below re-runs against the moved anchors. Stable identity so the
  // child effect that calls it doesn't refire on every workspace render.
  const [, setGeomTick] = useState(0);
  const bumpGeom = useCallback(() => setGeomTick((t) => t + 1), []);

  // Measure each link's connector between the two anchor dots — the source noun's
  // relative-clause control and the target noun's receiving dot — in workspace-relative
  // pixels. Falls back to the noun boxes (bottom-center → top-center) until the anchors
  // mount. Runs on every render, including the geometry bumps a child fires on drag, so
  // the line tracks a box moved inside a container. Guarded so it settles.
  useLayoutEffect(() => {
    const root = workspaceRef.current;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const next: Connector[] = [];
    // Conditional connectors: main clause's border control → "if" clause's border control.
    for (const link of links) {
      if (!isConditionalLink(link)) continue;
      const srcAnchor = borderAnchorEls.current.get(link.source.containerId);
      const tgtAnchor = borderAnchorEls.current.get(link.target.containerId);
      const srcBox = boxEls.current.get(`${link.source.containerId}:subject`);
      const tgtBox = boxEls.current.get(`${link.target.containerId}:subject`);
      const rect = srcAnchor ?? srcBox;
      const trect = tgtAnchor ?? tgtBox;
      if (!rect || !trect) continue;
      const s = rect.getBoundingClientRect();
      const t = trect.getBoundingClientRect();
      next.push({
        id: link.id,
        kind: "conditional",
        x1: s.left + s.width / 2 - rootRect.left,
        y1: s.top + s.height / 2 - rootRect.top,
        x2: t.left + t.width / 2 - rootRect.left,
        y2: t.top + t.height / 2 - rootRect.top,
        color: MUI_COLOR_HEX.warning,
        label: "if",
      });
    }
    // Coordinative connectors: first clause's border control → second clause's border control.
    for (const link of links) {
      if (!isCoordinativeLink(link)) continue;
      const srcAnchor = borderAnchorEls.current.get(link.source.containerId);
      const tgtAnchor = borderAnchorEls.current.get(link.target.containerId);
      const srcBox = boxEls.current.get(`${link.source.containerId}:subject`);
      const tgtBox = boxEls.current.get(`${link.target.containerId}:subject`);
      const rect = srcAnchor ?? srcBox;
      const trect = tgtAnchor ?? tgtBox;
      if (!rect || !trect) continue;
      const s = rect.getBoundingClientRect();
      const t = trect.getBoundingClientRect();
      next.push({
        id: link.id,
        kind: "coordinative",
        x1: s.left + s.width / 2 - rootRect.left,
        y1: s.top + s.height / 2 - rootRect.top,
        x2: t.left + t.width / 2 - rootRect.left,
        y2: t.top + t.height / 2 - rootRect.top,
        color: MUI_COLOR_HEX.info,
        label: COORD_CONJUNCTION_LABEL[link.conjunction].toLowerCase(),
      });
    }
    for (const link of links) {
      if (!isRelativeLink(link)) continue;
      const srcAnchor = sourceAnchorEls.current.get(
        boxKey(link.source.containerId, link.source.nounKey),
      );
      const tgtAnchor = targetAnchorEls.current.get(
        boxKey(link.target.containerId, link.target.nounKey),
      );
      const srcBox = boxEls.current.get(
        boxKey(link.source.containerId, link.source.nounKey),
      );
      const tgtBox = boxEls.current.get(
        boxKey(link.target.containerId, link.target.nounKey),
      );
      // Start point: the source anchor's center, else the source box's bottom-center.
      let x1: number, y1: number;
      if (srcAnchor) {
        const s = srcAnchor.getBoundingClientRect();
        x1 = s.left + s.width / 2 - rootRect.left;
        y1 = s.top + s.height / 2 - rootRect.top;
      } else if (srcBox) {
        const s = srcBox.getBoundingClientRect();
        x1 = s.left + s.width / 2 - rootRect.left;
        y1 = s.bottom - rootRect.top;
      } else continue;
      // End point: the target anchor's center, else the target box's top-center.
      let x2: number, y2: number;
      if (tgtAnchor) {
        const t = tgtAnchor.getBoundingClientRect();
        x2 = t.left + t.width / 2 - rootRect.left;
        y2 = t.top + t.height / 2 - rootRect.top;
      } else if (tgtBox) {
        const t = tgtBox.getBoundingClientRect();
        x2 = t.left + t.width / 2 - rootRect.left;
        y2 = t.top - rootRect.top;
      } else continue;
      // A possessor-sourced link's noun key is an address (`route/possessor`); colour it by
      // its base noun so the line keeps that noun's colour.
      const baseKey = link.source.nounKey.split("/")[0];
      const color =
        MUI_COLOR_HEX[
          ALL_SLOTS.find((sl) => sl.key === baseKey)?.color ?? "primary"
        ];
      next.push({ id: link.id, kind: "relative", x1, y1, x2, y2, color });
    }
    setConnectors((prev) => (sameConnectors(prev, next) ? prev : next));
  });

  return {
    workspaceRef,
    boxEls,
    sourceAnchorEls,
    targetAnchorEls,
    borderAnchorEls,
    bumpGeom,
    connectors,
  };
}
