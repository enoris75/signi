// The geometry of a coordinated noun on its canvas. A group ("the cat, the dog or the fox") is drawn
// as a chain of rings: the noun block's own ring first, then one ring per conjunct, each joined to
// the ring before it by a line carrying the group's conjunction. A conjunct's ring is painted by its
// own noun-phrase builder (see ConjunctRings), but it lives on the head's canvas — placed, dragged
// and kept clear of the other rings there — so everything about where the chain sits is worked out
// here, from what each conjunct's builder reports about the ring it drew.

import type { NounKey, PhraseSelection } from "./interfaces.ts";
import { CONJUNCTS_KEY } from "./interfaces.ts";
import { COORDINABLE_NOUN_KEYS } from "./slots.ts";
import { angleTo, BUTTON_HALF, onCircle, ringFootprint, type Pt } from "./ringLayout.ts";
import { portKey, type GroupDef } from "./ringSpecs.ts";
import type { GroupRect } from "./graph.ts";
import type { PositionMap } from "./layout.ts";

/** The node key a conjunct's ring goes by on its head's canvas: `subject+1` is the subject's first. */
export const conjunctKey = (which: NounKey, i: number): string => `${which}+${i + 1}`;

/** A group's rings in reading order: the head's word, then each conjunct's key. */
export const chainKeys = (which: NounKey, count: number): string[] => [
  which,
  ...Array.from({ length: count }, (_, i) => conjunctKey(which, i)),
];

/** The port on member `from`'s dotted ring that the line to member `to` leaves from. */
export const chainPortKey = (from: string, to: string): string => portKey(from, to);

// Clear space left between two rings of a group, in canvas px: room for the conjunction chip.
export const CONJUNCT_GAP = 44;
// How far a conjunct's dotted ring is taken to reach before its builder has measured it.
export const UNMEASURED_R = 72;

/** What a conjunct's builder reports about the ring it drew. */
export type ConjunctRing = {
  rIn: number;
  orbit: number;
  rOut: number;
  // Where each of its link ports sits, relative to the ring's centre, keyed by port.
  ports: Record<string, Pt>;
};

/** Equal within half a pixel everywhere — lets the report settle instead of looping. */
export function sameConjunctRing(a: ConjunctRing | undefined, b: ConjunctRing): boolean {
  if (!a) return false;
  const close = (p: number, q: number) => Math.abs(p - q) <= 0.5;
  if (!close(a.rIn, b.rIn) || !close(a.orbit, b.orbit) || !close(a.rOut, b.rOut)) return false;
  const keys = Object.keys(b.ports);
  if (keys.length !== Object.keys(a.ports).length) return false;
  return keys.every((k) => a.ports[k] && close(a.ports[k].x, b.ports[k].x) && close(a.ports[k].y, b.ports[k].y));
}

/**
 * Noun blocks that currently coordinate — the ones with a head word and at least one conjunct.
 */
export function openConjunctsFor(selection: PhraseSelection): NounKey[] {
  return COORDINABLE_NOUN_KEYS.filter(
    (which) =>
      selection[which] &&
      ((selection[CONJUNCTS_KEY(which)] as PhraseSelection[] | undefined)?.length ?? 0) > 0,
  );
}

/**
 * Where a ring without a stored position starts: straight below the ring before it in its chain,
 * a chip's height clear of it. `prevROut` is how far that ring reaches; `rOut`, this one.
 */
export function belowRing(prevCenter: Pt, prevROut: number, rOut: number = UNMEASURED_R): Pt {
  return { x: prevCenter.x, y: prevCenter.y + prevROut + CONJUNCT_GAP + 2 * BUTTON_HALF + rOut };
}

/**
 * A conjunct's ring as one constituent of its head's canvas — the footprint the overlap resolver
 * keeps clear and tidying packs. Its only node is its own key, so shoving it moves its whole ring.
 */
export function conjunctRect({
  key,
  color,
  head,
  index,
  center,
  ring,
  compact,
}: {
  key: string;
  color: string;
  // The head's group label, and which conjunct of it this is.
  head: string;
  index: number;
  center: Pt;
  ring: ConjunctRing;
  compact: boolean;
}): GroupRect {
  const def: GroupDef = { label: key, color, mainKey: key, nodeKeys: [key], conjunct: { head, index } };
  return {
    ...def,
    ...ringFootprint(center, compact ? ring.rIn : ring.rOut),
    center,
    rIn: ring.rIn,
    orbit: ring.orbit,
    rOut: ring.rOut,
  };
}

/** One line of a chain: from the ring before, to the conjunct, and where its chip sits. */
export type ConjunctLink = {
  which: NounKey;
  index: number;
  from: Pt;
  to: Pt;
  mid: Pt;
};

/**
 * The lines joining each coordinated block's rings. Each runs port to port on the two dotted rings
 * (solid ring to solid ring in compact view, which draws no dotted rings). A link is left out until
 * both of its rings have been drawn.
 */
export function conjunctLinks({
  chains,
  centerOf,
  headRing,
  headPort,
  rings,
  compact,
}: {
  // Each coordinated block, with the number of its conjuncts.
  chains: { which: NounKey; count: number }[];
  centerOf: (key: string) => Pt;
  // The head's own ring (from the head canvas's layout), and where its ports sit.
  headRing: (which: NounKey) => { rIn: number; rOut: number } | undefined;
  headPort: (port: string) => Pt | undefined;
  rings: Record<string, ConjunctRing>;
  compact: boolean;
}): ConjunctLink[] {
  const links: ConjunctLink[] = [];
  for (const { which, count } of chains) {
    const keys = chainKeys(which, count);
    for (let i = 0; i < count; i++) {
      const prev = keys[i];
      const key = keys[i + 1];
      const ring = rings[key];
      const prevRing = i === 0 ? headRing(which) : rings[prev];
      if (!ring || !prevRing) continue;
      const a = centerOf(prev);
      const b = centerOf(key);
      const edge = (c: Pt, r: number, toward: Pt) => onCircle(c, r, angleTo(c, toward));
      let from: Pt;
      let to: Pt;
      if (compact) {
        from = edge(a, prevRing.rIn, b);
        to = edge(b, ring.rIn, a);
      } else {
        const out = chainPortKey(prev, key);
        const back = chainPortKey(key, prev);
        const prevOffset = i === 0 ? undefined : rings[prev].ports[out];
        from =
          (i === 0 ? headPort(out) : prevOffset && { x: a.x + prevOffset.x, y: a.y + prevOffset.y }) ??
          edge(a, prevRing.rOut, b);
        const offset = ring.ports[back];
        to = offset ? { x: b.x + offset.x, y: b.y + offset.y } : edge(b, ring.rOut, a);
      }
      links.push({ which, index: i, from, to, mid: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 } });
    }
  }
  return links;
}

/**
 * Drop conjunct `i` of `which` from the stored positions: the rings after it take one step up the
 * chain, and keep the places they had.
 */
export function dropConjunctPosition(
  positions: PositionMap,
  which: NounKey,
  i: number,
  count: number,
): PositionMap {
  const next = { ...positions };
  for (let j = i; j < count - 1; j++) {
    const later = positions[conjunctKey(which, j + 1)];
    if (later) next[conjunctKey(which, j)] = later;
    else delete next[conjunctKey(which, j)];
  }
  delete next[conjunctKey(which, count - 1)];
  return next;
}
