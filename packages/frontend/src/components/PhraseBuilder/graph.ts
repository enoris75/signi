import { COMPLEMENT_LABELS } from "@signi/shared";
import { SlotConfig } from "./interfaces.ts";
import type { SatelliteIcon } from "./Boxes.tsx";
import {
  adjectiveSlots,
  ALL_SLOTS,
  BOX_COMPLEMENT_TYPES,
  COMPLEMENT_LABEL_KEYS,
  MODAL_ADVERB_SLOTS,
  MODAL_SLOTS,
  MUI_COLOR_HEX,
} from "./slots.ts";
import {
  angleTo,
  layoutRing,
  onCircle,
  ringFootprint,
  type Disc,
  type Pt,
  type RingSpec,
} from "./ringLayout.ts";
import { portKey, verbEnd, VERB_PHRASE, type GroupDef } from "./ringSpecs.ts";

export type { Pt } from "./ringLayout.ts";

export type Edge = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  // dashed = the faint satellite links, and a noun's line to the noun it points to as its owner; the
  // links between constituents are solid.
  dashed: boolean;
  // A line that bows, through this control point of a quadratic curve, rather than running straight.
  via?: Pt;
};

/** The edge a line between two rings is drawn as: straight, or bowed through its `via`. */
export function linkEdge(link: { from: Pt; to: Pt; via?: Pt }, color: string, dashed: boolean): Edge {
  return {
    x1: link.from.x,
    y1: link.from.y,
    x2: link.to.x,
    y2: link.to.y,
    ...(link.via && { via: link.via }),
    color,
    dashed,
  };
}

export type Rect = { x: number; y: number; width: number; height: number };

/**
 * One constituent as laid out on the canvas: its rings, and the square they (and the controls
 * straddling the dotted ring) take up — the footprint that tidying and overlap resolution pack.
 */
export type GroupRect = Rect &
  GroupDef & {
    center: Pt;
    rIn: number;
    orbit: number;
    rOut: number;
  };

// A node's measured content, in px. Nodes are centred on their position.
export type NodeSize = { w: number; h: number };
export type SizeFn = (key: string) => NodeSize;

// What a node measures before anyone has measured it: a labelled one-word box.
export const DEFAULT_NODE_SIZE: NodeSize = { w: 64, h: 32 };

// The constituents a canvas holds, and which of their nodes are shown.
export function roleGroups({
  drawCanvas,
  nounPhrase = false,
  showSubject = true,
  visibleSlots,
  shownMap,
}: {
  // Whether to paint the canvas at all: true once the period has a subject or verb (or in
  // noun-phrase mode). Before that the builder shows its empty-state opening picker instead.
  drawCanvas: boolean;
  // Verbless noun-phrase mode: the canvas holds a single noun phrase (the `subject` word and its
  // satellites) with no verb phrase, objects, or links between constituents.
  nounPhrase?: boolean;
  // Whether the Subject constituent is drawn. False where the subject is not a word on this canvas.
  showSubject?: boolean;
  visibleSlots: SlotConfig[];
  shownMap: Record<string, boolean>;
}): GroupDef[] {
  if (!drawCanvas) return [];
  const shown = (keys: string[]) => keys.filter((k) => shownMap[k]);
  return [
    ...(showSubject
      ? [
          {
            label: "Subject",
            labelKey: "slot.subject" as const,
            color: MUI_COLOR_HEX.primary,
            mainKey: "subject",
            nodeKeys: ["subject", ...shown([...adjectiveSlots("subject"), "subjectDefiniteness"])],
          },
        ]
      : []),
    // The verb phrase and the constituents hanging off it exist only in a full phrase.
    ...(nounPhrase
      ? []
      : [
          {
            label: VERB_PHRASE,
            color: MUI_COLOR_HEX.secondary,
            mainKey: "verb",
            nodeKeys: [
              "verb",
              ...shown([...MODAL_SLOTS, ...MODAL_ADVERB_SLOTS, "verbTense", "verbAspect", "modifier"]),
            ],
          },
        ]),
    // The object, like a complement, is on the canvas only while its control on the verb phrase
    // says so — the difference being that its control starts out saying yes.
    ...(visibleSlots.some((s) => s.key === "directObject") && shownMap.directObject
      ? [
          {
            label: "Direct Object",
            labelKey: "slot.directObject" as const,
            color: MUI_COLOR_HEX.success,
            mainKey: "directObject",
            nodeKeys: [
              "directObject",
              ...shown([...adjectiveSlots("directObject"), "directObjectDefiniteness"]),
            ],
          },
        ]
      : []),
    ...BOX_COMPLEMENT_TYPES.filter((type) => shownMap[type]).map((type) => ({
      label: COMPLEMENT_LABELS[type],
      labelKey: COMPLEMENT_LABEL_KEYS[type],
      color: MUI_COLOR_HEX.warning,
      mainKey: type as string,
      removeKey: type,
      nodeKeys: [type as string, ...shown([...adjectiveSlots(type), `${type}Definiteness`])],
    })),
  ];
}

/**
 * Lay out every constituent's rings round its word, returning each constituent's rings and
 * footprint, where every satellite disc sits, and where every control sits — keyed by control.
 */
export function buildRings({
  groups,
  specs,
  centerOf,
  sizeOf,
  compact,
}: {
  groups: GroupDef[];
  specs: Record<string, RingSpec>;
  centerOf: (mainKey: string) => Pt;
  sizeOf: SizeFn;
  // Compact view draws only the solid rings, so a constituent takes up just that much room.
  compact: boolean;
}): { groupRects: GroupRect[]; discs: Record<string, Disc>; controlPos: Record<string, Pt> } {
  const groupRects: GroupRect[] = [];
  const discs: Record<string, Disc> = {};
  const controlPos: Record<string, Pt> = {};
  for (const group of groups) {
    const ring = layoutRing(centerOf(group.mainKey), specs[group.label], sizeOf, group.mainKey);
    Object.assign(discs, ring.discs);
    Object.assign(controlPos, ring.controls);
    groupRects.push({
      ...group,
      ...ringFootprint(ring.center, compact ? ring.rIn : ring.rOut),
      center: ring.center,
      rIn: ring.rIn,
      orbit: ring.orbit,
      rOut: ring.rOut,
    });
  }
  return { groupRects, discs, controlPos };
}

// The colour a satellite's link is drawn in: its own slot's, else its constituent's.
function satelliteColor(key: string, group: GroupRect): string {
  const slot = ALL_SLOTS.find((s) => s.key === key);
  return slot ? MUI_COLOR_HEX[slot.color] : group.color;
}

/**
 * The lines the connector layer paints: a faint one from each satellite's reveal control to its
 * disc, and a solid one from the verb phrase to each other constituent — port to port on their
 * dotted rings (or solid ring to solid ring in compact view, which has no dotted rings).
 */
export function buildEdges({
  groupRects,
  discs,
  controlPos,
  complementToggleIcons,
  directObjectToggle,
  compact,
  standIns = {},
}: {
  groupRects: GroupRect[];
  discs: Record<string, Disc>;
  controlPos: Record<string, Pt>;
  complementToggleIcons: readonly SatelliteIcon[];
  directObjectToggle?: SatelliteIcon;
  compact: boolean;
  // The other rings that stand for a constituent, by its label: a coordinated noun's conjuncts. In
  // compact view the line to the verb phrase runs to whichever ring of the group sits nearest it,
  // rather than through the rest of the group packed beside it.
  standIns?: Record<string, readonly { center: Pt; rIn: number }[]>;
}): { edges: Edge[]; groupEdges: Edge[] } {
  const edges: Edge[] = [];
  for (const group of groupRects) {
    for (const key of group.nodeKeys) {
      const disc = discs[key];
      if (!disc) continue;
      const from = controlPos[key] ?? group.center;
      // End on the disc's rim, where the dot marking the satellite's end stays visible.
      const end = onCircle(disc, disc.r, angleTo(disc, from));
      edges.push({ x1: from.x, y1: from.y, x2: end.x, y2: end.y, color: satelliteColor(key, group), dashed: true });
    }
  }

  const groupEdges: Edge[] = [];
  const verb = groupRects.find((g) => g.label === VERB_PHRASE);
  if (verb) {
    for (const group of groupRects) {
      if (group === verb) continue;
      let from: Pt | undefined;
      let to: Pt | undefined;
      if (compact) {
        const dist = (p: Pt) => Math.hypot(p.x - verb.center.x, p.y - verb.center.y);
        const end = [group, ...(standIns[group.label] ?? [])].reduce((a, b) =>
          dist(b.center) < dist(a.center) ? b : a,
        );
        from = onCircle(verb.center, verb.rIn, angleTo(verb.center, end.center));
        to = onCircle(end.center, end.rIn, angleTo(end.center, verb.center));
      } else {
        const end = verbEnd(group, complementToggleIcons, directObjectToggle);
        from = controlPos[end ?? portKey(VERB_PHRASE, group.label)];
        to = controlPos[portKey(group.label, VERB_PHRASE)];
      }
      if (!from || !to) continue;
      groupEdges.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, color: group.color, dashed: false });
    }
  }
  return { edges, groupEdges };
}
