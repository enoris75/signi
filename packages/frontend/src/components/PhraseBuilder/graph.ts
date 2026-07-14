import { COMPLEMENT_LABELS } from "@signi/shared";
import { BoxComplementType, SlotConfig } from "./interfaces.ts";
import {
  adjectiveChainParent,
  adjectiveSlots,
  modalChainParent,
  BOX_COMPLEMENT_TYPES,
  MODAL_SLOTS,
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

export type Rect = { x: number; y: number; width: number; height: number };

export type GroupRect = Rect & {
  label: string;
  color: string;
  nodeKeys: string[];
  // Set on complement groups — these carry an "x" to remove the whole box.
  removeKey?: BoxComplementType;
};

// The identity of a role group, before its rect is measured.
export type GroupShape = { nodeKeys: string[]; removeKey?: BoxComplementType };

export type Pt = { x: number; y: number };
type PosFn = (key: string) => Pt;

// A word box's measured pixel footprint. Nodes are centered on their position, so a box
// spans half its size either side of that point.
export type NodeSize = { w: number; h: number };
export type SizeFn = (key: string) => NodeSize;

// Role-group bounding-rect padding, in SVG pixels.
export const PIX_PAD_H = 80; // left & right — covers widest slot box half-width
// Top & bottom must clear not just the box half-height but the satellite reveal
// controls that ride the box border (each ~20px tall, straddling the edge) plus the
// clear/adjective toggles on the corners — otherwise they superimpose on the dashed edge.
export const PIX_PAD_TOP = 48;
export const PIX_PAD_BOT = 52;
// The route and cause boxes each carry a specifier toolbar on their top edge (path
// relation / sentiment); give them extra headroom so it clears the box label.
export const ROUTE_PAD_TOP = 40;

// The word box the pads above are cut to fit: a minimum-width slot box, half its size.
// A node is only allowed to push its dotted box out by however much it exceeds this, so a
// box of ordinary words keeps exactly the geometry the pads were tuned for, and one
// holding a long word — or a tall one, wearing a degree/relation chip — grows to wrap it.
const NOMINAL_HALF_W = 54;
const NOMINAL_HALF_H = 26;
// What a node's box measures before anyone has measured it (the first frame, and the
// toggle boxes on a canvas that hasn't painted yet).
export const DEFAULT_NODE_SIZE: NodeSize = {
  w: NOMINAL_HALF_W * 2,
  h: NOMINAL_HALF_H * 2,
};

// Compact-view padding: the dashed boxes and their border controls are hidden, so a
// group rect only has to hug its lone core word (plus a hair of gap for the spine).
// Much tighter than the full-view pads above — this is what shrinks the canvas.
export const COMPACT_PAD_H = 66;
export const COMPACT_PAD_TOP = 30;
export const COMPACT_PAD_BOT = 30;

// The padding a group's dotted box wraps around its node cluster, in SVG pixels.
// Compact hugs the lone core word with tight, uniform pads (no toolbar headroom, since
// the specifier toolbars are hidden too); full view uses the generous pads above.
export function groupPads(
  removeKey: BoxComplementType | undefined,
  compact: boolean,
): { padH: number; padTop: number; padBot: number } {
  if (compact)
    return {
      padH: COMPACT_PAD_H,
      padTop: COMPACT_PAD_TOP,
      padBot: COMPACT_PAD_BOT,
    };
  return {
    padH: PIX_PAD_H,
    padTop:
      removeKey === "route" || removeKey === "cause"
        ? PIX_PAD_TOP + ROUTE_PAD_TOP
        : PIX_PAD_TOP,
    padBot: PIX_PAD_BOT,
  };
}

// The dotted box a group's nodes trace out, in canvas pixels, before the canvas-edge
// clamp that `buildGraph` applies for painting. The overlap resolver works on these raw
// rects: a box shoved against the canvas edge must still report its true footprint, or it
// would read as narrower than it is and never get pushed clear of its neighbour.
//
// Each node claims its own pad, widened by however far its box overhangs the nominal one
// the pads assume — so a group holding a long word wraps that word rather than letting it
// spill through the dashed border. `sizeOf` may be omitted where the nodes are known to be
// ordinary, in which case every pad is the plain one.
export function rawGroupRect(
  group: GroupShape,
  pos: PosFn,
  svgSize: { w: number; h: number },
  compact: boolean,
  sizeOf: SizeFn = () => DEFAULT_NODE_SIZE,
): Rect {
  const { padH, padTop, padBot } = groupPads(group.removeKey, compact);
  const extents = group.nodeKeys.map((k) => {
    const p = pos(k);
    const size = sizeOf(k);
    const overH = Math.max(0, size.w / 2 - NOMINAL_HALF_W);
    const overV = Math.max(0, size.h / 2 - NOMINAL_HALF_H);
    const cx = (p.x / 100) * svgSize.w;
    const cy = (p.y / 100) * svgSize.h;
    return {
      left: cx - padH - overH,
      right: cx + padH + overH,
      top: cy - padTop - overV,
      bottom: cy + padBot + overV,
    };
  });
  const x = Math.min(...extents.map((e) => e.left));
  const y = Math.min(...extents.map((e) => e.top));
  return {
    x,
    y,
    width: Math.max(...extents.map((e) => e.right)) - x,
    height: Math.max(...extents.map((e) => e.bottom)) - y,
  };
}

export const rectCenter = (r: Rect): Pt => ({
  x: r.x + r.width / 2,
  y: r.y + r.height / 2,
});

// Point where the segment from r's center toward (tx, ty) crosses r's border,
// so the link starts/ends on the dashed box edge rather than inside it.
export const rectBorderPoint = (r: Rect, tx: number, ty: number): Pt => {
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
  drawCanvas,
  nounPhrase = false,
  showSubject = true,
  compact = false,
  renderedSlots,
  visibleSlots,
  shownMap,
  pos,
  controlPos,
  sizeOf,
  svgSize,
}: {
  // Whether to paint the canvas at all: true once the period has a subject or verb (or in
  // noun-phrase mode). Before that the builder shows its empty-state opening picker instead.
  drawCanvas: boolean;
  // Verbless noun-phrase mode: the canvas holds a single noun phrase (the `subject`
  // box + its satellites) with no verb phrase, objects, or inter-group links. Used by
  // the possessor editor, which is a full noun phrase but has no predicate.
  nounPhrase?: boolean;
  // Whether the Subject role group is drawn. False inside a relative clause, whose
  // subject is the (external) head noun rather than a box on this canvas.
  showSubject?: boolean;
  // Compact view: shrink the group rects to hug their core word (the dashed boxes and
  // their border controls are hidden), so the spine connects tightly-packed chips.
  compact?: boolean;
  renderedSlots: SlotConfig[];
  visibleSlots: SlotConfig[];
  shownMap: Record<string, boolean>;
  pos: PosFn;
  // Measured pixel centers (canvas-relative) of the satellite reveal controls
  // riding each core box's border, keyed by satellite key. When present, a
  // satellite's dashed link starts here — from its own control — instead of the
  // core box center. Missing (not yet measured) → fall back to the box center.
  controlPos: Record<string, Pt>;
  // Measured pixel size of every node box, so a group rect can wrap a word wider or
  // taller than the padding assumes.
  sizeOf: SizeFn;
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

  // Both the satellite edges and the role-group rects draw whenever the canvas is shown —
  // a period with a subject/verb, or a lone noun phrase (nounPhrase mode).
  const edges: Edge[] = [];
  if (drawCanvas) {
    for (const slot of renderedSlots) {
      if (slot.key === "verb") continue;
      // Main constituents (subject, objects, complements) link group-to-group
      // (dotted box ↔ dotted box) below, not box-to-box here. Adjectives/adverb
      // still link within their own box.
      if (
        slot.key === "subject" ||
        slot.key === "directObject" ||
        COMPLEMENT_KEY_SET.has(slot.key)
      )
        continue;
      // A chained adjective hangs off the previous one, so its link starts on that box
      // rather than on the noun; the first adjective links back to its noun. Modals chain
      // the same way, the first one hanging off the verb.
      const complementParent = COMPLEMENT_ADJECTIVE_TYPE[slot.key];
      const parentKey =
        adjectiveChainParent(slot.key) ??
        modalChainParent(slot.key) ??
        (slot.key === "subjectAdjective"
          ? "subject"
          : slot.key === "directObjectAdjective"
            ? "directObject"
            : (complementParent ?? "verb"));
      edges.push(satEdge(parentKey, slot.key, MUI_COLOR_HEX[slot.color]));
    }
    if (shownMap.verbTense)
      edges.push(satEdge("verb", "verbTense", MUI_COLOR_HEX.secondary));
    if (shownMap.verbAspect)
      edges.push(satEdge("verb", "verbAspect", MUI_COLOR_HEX.secondary));
    if (shownMap.subjectDefiniteness)
      edges.push(satEdge("subject", "subjectDefiniteness", "#888"));
    if (shownMap.directObjectDefiniteness)
      edges.push(
        satEdge(
          "directObject",
          "directObjectDefiniteness",
          MUI_COLOR_HEX.success,
        ),
      );
    for (const type of BOX_COMPLEMENT_TYPES) {
      if (shownMap[`${type}Definiteness`])
        edges.push(satEdge(type, `${type}Definiteness`, MUI_COLOR_HEX.warning));
    }
  }

  // Role-group bounding rects (coordinates in SVG pixels = CSS pixels since the
  // viewBox matches the container).
  const groupRects: GroupRect[] = [];
  if (drawCanvas) {
    const roleGroups: Array<{
      label: string;
      color: string;
      nodeKeys: string[];
      removeKey?: BoxComplementType;
    }> = [
      ...(showSubject
        ? [
            {
              label: "Subject",
              color: MUI_COLOR_HEX.primary,
              nodeKeys: [
                ...adjectiveSlots("subject").filter((k) => shownMap[k]),
                "subject",
                ...(shownMap.subjectDefiniteness
                  ? ["subjectDefiniteness"]
                  : []),
              ],
            },
          ]
        : []),
      // The verb phrase and its satellite objects/complements exist only in a full
      // phrase — a lone noun phrase (possessor editor) has just the subject group.
      ...(nounPhrase ? [] : [{
        label: "Verb Phrase",
        color: MUI_COLOR_HEX.secondary,
        nodeKeys: [
          ...MODAL_SLOTS.filter((k) => shownMap[k]),
          "verb",
          ...(shownMap.verbTense ? ["verbTense"] : []),
          ...(shownMap.verbAspect ? ["verbAspect"] : []),
          ...(shownMap.modifier ? ["modifier"] : []),
        ],
      }]),
      // The object's box, like a complement's, is on the canvas only while its control on the
      // verb-phrase box says so — the difference being that its control starts out saying yes.
      ...(visibleSlots.some((s) => s.key === "directObject") &&
      shownMap.directObject
        ? [
            {
              label: "Direct Object",
              color: MUI_COLOR_HEX.success,
              nodeKeys: [
                "directObject",
                ...adjectiveSlots("directObject").filter((k) => shownMap[k]),
                ...(shownMap.directObjectDefiniteness
                  ? ["directObjectDefiniteness"]
                  : []),
              ],
            },
          ]
        : []),
      // One dashed box per revealed complement (Locative / Direction / Source / Route).
      ...BOX_COMPLEMENT_TYPES.filter((type) => shownMap[type]).map((type) => ({
        label: COMPLEMENT_LABELS[type],
        color: MUI_COLOR_HEX.warning,
        removeKey: type,
        nodeKeys: [
          ...adjectiveSlots(type).filter((k) => shownMap[k]),
          type,
          ...(shownMap[`${type}Definiteness`] ? [`${type}Definiteness`] : []),
        ],
      })),
    ];

    // Painted rects are the raw footprints clipped to the canvas, so a box that spills
    // over an edge is drawn flush against it rather than off-screen.
    for (const g of roleGroups) {
      const raw = rawGroupRect(g, pos, svgSize, compact, sizeOf);
      const rx = Math.max(0, raw.x);
      const ry = Math.max(0, raw.y);
      groupRects.push({
        label: g.label,
        color: g.color,
        nodeKeys: g.nodeKeys,
        removeKey: g.removeKey,
        x: rx,
        y: ry,
        width: Math.min(svgSize.w, raw.x + raw.width) - rx,
        height: Math.min(svgSize.h, raw.y + raw.height) - ry,
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
