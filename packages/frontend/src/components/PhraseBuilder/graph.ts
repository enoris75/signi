import {
  COMPLEMENT_TYPES,
  COMPLEMENT_LABELS,
  type ComplementType,
} from "@signi/shared";
import { SlotConfig } from "./interfaces.ts";
import {
  COMPLEMENT_ADJECTIVE_TYPE,
  COMPLEMENT_KEY_SET,
  MUI_COLOR_HEX,
} from "./slots.ts";

export type Edge = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  // dashed = the faint satellite/adjective links; group links are solid.
  dashed: boolean;
};

export type GroupRect = {
  label: string;
  color: string;
  nodeKeys: string[];
  // Set on complement groups — these carry an "x" to remove the whole box.
  removeKey?: ComplementType;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Pt = { x: number; y: number };
type PosFn = (key: string) => Pt;

// Role-group bounding-rect padding, in SVG pixels.
const PIX_PAD_H = 80; // left & right — covers widest slot box half-width
const PIX_PAD_TOP = 35;
const PIX_PAD_BOT = 40;
// The route box carries the path-specifier toolbar on its top edge; give it
// extra headroom so the toolbar clears the ROUTE label.
const ROUTE_PAD_TOP = 40;

const rectCenter = (r: GroupRect): Pt => ({
  x: r.x + r.width / 2,
  y: r.y + r.height / 2,
});

// Point where the segment from r's center toward (tx, ty) crosses r's border,
// so the link starts/ends on the dashed box edge rather than inside it.
const rectBorderPoint = (r: GroupRect, tx: number, ty: number): Pt => {
  const cx = r.x + r.width / 2;
  const cy = r.y + r.height / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const hw = r.width / 2;
  const hh = r.height / 2;
  const scale = 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh);
  return { x: cx + dx * scale, y: cy + dy * scale };
};

// Assemble everything the SVG layer draws: the faint intra-group satellite edges,
// the dashed role-group bounding boxes, and the solid links between those boxes.
export function buildGraph({
  hasVerb,
  renderedSlots,
  visibleSlots,
  shownMap,
  pos,
  controlPos,
  svgSize,
}: {
  hasVerb: boolean;
  renderedSlots: SlotConfig[];
  visibleSlots: SlotConfig[];
  shownMap: Record<string, boolean>;
  pos: PosFn;
  // Measured pixel centers (canvas-relative) of the satellite reveal controls
  // riding each core box's border, keyed by satellite key. When present, a
  // satellite's dashed link starts here — from its own control — instead of the
  // core box center. Missing (not yet measured) → fall back to the box center.
  controlPos: Record<string, Pt>;
  svgSize: { w: number; h: number };
}): { edges: Edge[]; groupRects: GroupRect[]; groupEdges: Edge[] } {
  const px = (pct: number, dim: number) => (pct / 100) * dim;
  const pxPt = (pt: Pt): Pt => ({
    x: px(pt.x, svgSize.w),
    y: px(pt.y, svgSize.h),
  });
  // A satellite link: from its control icon on the core box (measured) to the
  // satellite node, both in canvas pixels.
  const satEdge = (coreKey: string, satKey: string, color: string): Edge => {
    const from = controlPos[satKey] ?? pxPt(pos(coreKey));
    const to = pxPt(pos(satKey));
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y, color, dashed: true };
  };

  const edges: Edge[] = [];
  if (hasVerb) {
    for (const slot of renderedSlots) {
      if (slot.key === "verb") continue;
      // Main constituents (subject, objects, complements) link group-to-group
      // (dotted box ↔ dotted box) below, not box-to-box here. Adjectives/adverb
      // still link within their own box.
      if (
        slot.key === "subject" ||
        slot.key === "directObject" ||
        slot.key === "indirectObject" ||
        COMPLEMENT_KEY_SET.has(slot.key)
      )
        continue;
      const complementParent = COMPLEMENT_ADJECTIVE_TYPE[slot.key];
      const parentKey =
        slot.key === "subjectAdjective" || slot.key === "subjectAdjective2"
          ? "subject"
          : slot.key === "directObjectAdjective" ||
              slot.key === "directObjectAdjective2"
            ? "directObject"
            : slot.key === "indirectObjectAdjective" ||
                slot.key === "indirectObjectAdjective2"
              ? "indirectObject"
              : (complementParent ?? "verb");
      edges.push(satEdge(parentKey, slot.key, MUI_COLOR_HEX[slot.color]));
    }
    if (shownMap.verbNegative)
      edges.push(satEdge("verb", "verbNegative", MUI_COLOR_HEX.secondary));
    if (shownMap.verbTense)
      edges.push(satEdge("verb", "verbTense", MUI_COLOR_HEX.secondary));
    if (shownMap.subjectNumber)
      edges.push(satEdge("subject", "subjectNumber", "#888"));
    if (shownMap.subjectGender)
      edges.push(satEdge("subject", "subjectGender", "#888"));
    if (shownMap.directObjectNumber)
      edges.push(
        satEdge("directObject", "directObjectNumber", MUI_COLOR_HEX.success),
      );
    if (shownMap.directObjectGender)
      edges.push(
        satEdge("directObject", "directObjectGender", MUI_COLOR_HEX.success),
      );
    if (shownMap.indirectObjectNumber)
      edges.push(
        satEdge(
          "indirectObject",
          "indirectObjectNumber",
          MUI_COLOR_HEX.warning,
        ),
      );
    if (shownMap.indirectObjectGender)
      edges.push(
        satEdge(
          "indirectObject",
          "indirectObjectGender",
          MUI_COLOR_HEX.warning,
        ),
      );
    for (const type of COMPLEMENT_TYPES) {
      if (shownMap[`${type}Number`])
        edges.push(satEdge(type, `${type}Number`, MUI_COLOR_HEX.warning));
      if (shownMap[`${type}Gender`])
        edges.push(satEdge(type, `${type}Gender`, MUI_COLOR_HEX.warning));
    }
  }

  // Role-group bounding rects (coordinates in SVG pixels = CSS pixels since the
  // viewBox matches the container).
  const groupRects: GroupRect[] = [];
  if (hasVerb) {
    const roleGroups: Array<{
      label: string;
      color: string;
      nodeKeys: string[];
      removeKey?: ComplementType;
    }> = [
      {
        label: "Subject",
        color: MUI_COLOR_HEX.primary,
        nodeKeys: [
          ...(shownMap.subjectAdjective ? ["subjectAdjective"] : []),
          ...(shownMap.subjectAdjective2 ? ["subjectAdjective2"] : []),
          "subject",
          ...(shownMap.subjectNumber ? ["subjectNumber"] : []),
          ...(shownMap.subjectGender ? ["subjectGender"] : []),
        ],
      },
      {
        label: "Verb Phrase",
        color: MUI_COLOR_HEX.secondary,
        nodeKeys: [
          "verb",
          ...(shownMap.verbNegative ? ["verbNegative"] : []),
          ...(shownMap.verbTense ? ["verbTense"] : []),
          ...(shownMap.modifier ? ["modifier"] : []),
        ],
      },
      ...(visibleSlots.some((s) => s.key === "directObject")
        ? [
            {
              label: "Direct Object",
              color: MUI_COLOR_HEX.success,
              nodeKeys: [
                "directObject",
                ...(shownMap.directObjectAdjective
                  ? ["directObjectAdjective"]
                  : []),
                ...(shownMap.directObjectAdjective2
                  ? ["directObjectAdjective2"]
                  : []),
                ...(shownMap.directObjectNumber ? ["directObjectNumber"] : []),
                ...(shownMap.directObjectGender ? ["directObjectGender"] : []),
              ],
            },
          ]
        : []),
      ...(visibleSlots.some((s) => s.key === "indirectObject")
        ? [
            {
              label: "Indirect Object",
              color: MUI_COLOR_HEX.warning,
              nodeKeys: [
                "indirectObject",
                ...(shownMap.indirectObjectAdjective
                  ? ["indirectObjectAdjective"]
                  : []),
                ...(shownMap.indirectObjectAdjective2
                  ? ["indirectObjectAdjective2"]
                  : []),
                ...(shownMap.indirectObjectNumber
                  ? ["indirectObjectNumber"]
                  : []),
                ...(shownMap.indirectObjectGender
                  ? ["indirectObjectGender"]
                  : []),
              ],
            },
          ]
        : []),
      // One dashed box per revealed complement (Locative / Direction / Source / Route).
      ...COMPLEMENT_TYPES.filter((type) => shownMap[type]).map((type) => ({
        label: COMPLEMENT_LABELS[type],
        color: MUI_COLOR_HEX.warning,
        removeKey: type,
        nodeKeys: [
          ...(shownMap[`${type}Adjective`] ? [`${type}Adjective`] : []),
          ...(shownMap[`${type}Adjective2`] ? [`${type}Adjective2`] : []),
          type,
          ...(shownMap[`${type}Number`] ? [`${type}Number`] : []),
          ...(shownMap[`${type}Gender`] ? [`${type}Gender`] : []),
        ],
      })),
    ];

    for (const g of roleGroups) {
      const pts = g.nodeKeys.map((k) => pos(k));
      const minXpct = Math.min(...pts.map((p) => p.x));
      const maxXpct = Math.max(...pts.map((p) => p.x));
      const minYpct = Math.min(...pts.map((p) => p.y));
      const maxYpct = Math.max(...pts.map((p) => p.y));
      const padTop =
        g.removeKey === "route" ? PIX_PAD_TOP + ROUTE_PAD_TOP : PIX_PAD_TOP;
      const rx = Math.max(0, px(minXpct, svgSize.w) - PIX_PAD_H);
      const ry = Math.max(0, px(minYpct, svgSize.h) - padTop);
      groupRects.push({
        label: g.label,
        color: g.color,
        nodeKeys: g.nodeKeys,
        removeKey: g.removeKey,
        x: rx,
        y: ry,
        width: Math.min(svgSize.w, px(maxXpct, svgSize.w) + PIX_PAD_H) - rx,
        height: Math.min(svgSize.h, px(maxYpct, svgSize.h) + PIX_PAD_BOT) - ry,
      });
    }
  }

  // Links between the dashed constituent boxes. Each phrase group connects to the
  // verb phrase (dotted box ↔ dotted box), mirroring the sentence's spine.
  const groupEdges: Edge[] = [];
  const verbRect = groupRects.find((g) => g.label === "Verb Phrase");
  if (verbRect) {
    const vC = rectCenter(verbRect);
    for (const g of groupRects) {
      if (g === verbRect) continue;
      const gC = rectCenter(g);
      const p1 = rectBorderPoint(g, vC.x, vC.y);
      const p2 = rectBorderPoint(verbRect, gC.x, gC.y);
      groupEdges.push({
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        color: g.color,
        dashed: false,
      });
    }
  }

  return { edges, groupRects, groupEdges };
}
