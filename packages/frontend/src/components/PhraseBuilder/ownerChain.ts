// The geometry of possession on a canvas. A noun's possessor is filled one of two ways, and each is
// drawn on the canvas its noun is on:
//
//  · a named owner ("the cat's book") is one more ring — the owner's noun phrase — joined to the
//    noun it owns by a line from that noun's possessor control;
//  · a pointed-to owner ("the boy and his horse") is a dashed line from that control to another
//    noun's ring in the period, carrying the possessive pronoun it renders.
//
// An owner's ring is painted by its own noun-phrase builder (see OwnerRings), but, like a
// conjunct's, it lives on the period's canvas — placed, dragged and kept clear of the other rings
// there — so where it sits and what joins it is all worked out here. Owners nest (an owner's owner,
// a conjunct's owner), and every one of them is on the one canvas.

import type { Concept } from "@signi/shared";
import {
  conjunctAddress,
  possessorAddress,
  POSSESSOR_KEY,
  POSSESSOR_REF_KEY,
  type NounAddress,
  type NounKey,
  type PhraseSelection,
} from "./interfaces.ts";
import { conjunctsOf } from "./phraseReducers.ts";
import { conjunctKey, CONJUNCT_GAP, UNMEASURED_R } from "./conjunctChain.ts";
import { angleTo, BUTTON_HALF, onCircle, type Pt } from "./ringLayout.ts";

/**
 * The key a noun's ring goes by on the period's canvas, from its address: a top-level noun's own
 * key, a conjunct's chain key, or — for an owner — its address itself. Undefined for an address no
 * ring answers to.
 */
export function canvasKeyOf(address: NounAddress): string | undefined {
  const steps = address.split("/");
  if (steps.length === 1) return address;
  if (steps[steps.length - 1] === "possessor") return address;
  if (steps.length === 3 && steps[1] === "conjunct") {
    const i = Number(steps[2]);
    return Number.isInteger(i) ? conjunctKey(steps[0] as NounKey, i) : undefined;
  }
  return undefined;
}

/** A named owner's ring: the owner, the noun it owns, and where it reads in its group. */
export type OwnerSpot = {
  // The owner's head — also its ring's key on the canvas.
  address: NounAddress;
  // The noun it owns, and that noun's ring on the canvas.
  possessed: NounAddress;
  possessedKey: string;
  // The period noun the owner hangs off, however deep: the ring wears its colour, and tidying packs
  // the owner into its group.
  role: NounKey;
  // Where tidying packs the ring among its group's (see packPeriod): straight after the ring it owns.
  order: number;
  // Whether the owner holds a word yet. An empty ring is the picker the owner starts as.
  named: boolean;
};

/** A pointed-to owner: the noun whose possessor it is, and the noun it points to. */
export type PointerSpot = {
  possessed: NounAddress;
  possessedKey: string;
  role: NounKey;
  antecedent: NounAddress;
  // The antecedent's ring, when one answers to its address.
  antecedentKey: string | undefined;
};

const isNoun = (concept: unknown) => (concept as Concept | undefined)?.role === "noun";

/**
 * Every owner on the canvas, in reading order — parents before the owners they hold. `nouns` are the
 * period's own nouns that may take an owner (drawn, with a noun head); each coordinated block in
 * `chains` lends its conjuncts too. A named owner's ring is shown unless the user folded it away
 * (`ownersOpen` false); an empty one only while it is open.
 */
export function possessionsFor({
  selection,
  nouns,
  chains,
  ownersOpen,
}: {
  selection: PhraseSelection;
  nouns: readonly NounKey[];
  chains: readonly { which: NounKey; count: number }[];
  ownersOpen: Readonly<Record<NounAddress, boolean>>;
}): { owners: OwnerSpot[]; pointers: PointerSpot[] } {
  const owners: OwnerSpot[] = [];
  const pointers: PointerSpot[] = [];

  const visit = (
    slice: PhraseSelection,
    which: NounKey,
    address: NounAddress,
    key: string,
    role: NounKey,
    order: number,
    depth: number,
  ) => {
    const antecedent = slice[POSSESSOR_REF_KEY(which)] as NounAddress | undefined;
    if (antecedent) {
      pointers.push({ possessed: address, possessedKey: key, role, antecedent, antecedentKey: canvasKeyOf(antecedent) });
      return;
    }
    const owner = slice[POSSESSOR_KEY(which)] as PhraseSelection | undefined;
    const named = Boolean(owner?.subject);
    if (!(ownersOpen[address] ?? named)) return;
    const ownerAddress = possessorAddress(address);
    // Halving steps keep an owner after the ring it owns and before the next ring of the group.
    const ownerOrder = order + 0.5 ** (depth + 1);
    owners.push({ address: ownerAddress, possessed: address, possessedKey: key, role, order: ownerOrder, named });
    if (owner && isNoun(owner.subject))
      visit(owner, "subject", ownerAddress, ownerAddress, role, ownerOrder, depth + 1);
  };

  for (const which of nouns) {
    visit(selection, which, which, which, which, -1, 0);
    const count = chains.find((c) => c.which === which)?.count ?? 0;
    conjunctsOf(selection, which)
      .slice(0, count)
      .forEach((conjunct, i) => {
        if (conjunct && isNoun(conjunct.subject))
          visit(conjunct, "subject", conjunctAddress(which, i), conjunctKey(which, i), which, i, 0);
      });
  }
  return { owners, pointers };
}

// How far from the canvas's side walls an owner's ring is kept when it is first placed, in px: room
// for an empty ring, whose word picker makes it wider than a one-word ring. A ring placed overhanging
// a wall never moves off it again — the overlap resolver shoves its neighbours instead.
export const OWNER_WALL_CLEARANCE = 100;

/**
 * Where an owner's ring without a stored position starts: below the ring it owns and to the side
 * facing the middle of the canvas, a chip's length clear of it, and clear of the canvas's side walls.
 * `ownedROut` is how far the owned ring reaches; `rOut`, this one.
 */
export function besideRing(
  ownedCenter: Pt,
  ownedROut: number,
  canvasW: number,
  rOut: number = UNMEASURED_R,
): Pt {
  const d = (ownedROut + CONJUNCT_GAP + 2 * BUTTON_HALF + rOut) * Math.SQRT1_2;
  const side = ownedCenter.x > canvasW / 2 ? -1 : 1;
  const x = Math.min(
    Math.max(ownedCenter.x + side * d, OWNER_WALL_CLEARANCE),
    Math.max(OWNER_WALL_CLEARANCE, canvasW - OWNER_WALL_CLEARANCE),
  );
  return { x, y: ownedCenter.y + d };
}

/** A ring on the canvas, as the lines joining it see it. */
export type RingAt = { center: Pt; rIn: number; rOut: number };

/**
 * One line of possession, and the midpoint a pronoun chip sits on. A line that bows through `via`
 * (the control point of a quadratic curve) has its midpoint on the curve.
 */
export type PossessionLink = { from: Pt; to: Pt; mid: Pt; via?: Pt };

const midpoint = (from: Pt, to: Pt): PossessionLink => ({
  from,
  to,
  mid: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
});

/**
 * The line from a noun to its owner. It leaves from the noun's possessor control and lands on the
 * port the owner's ring reported facing it; in compact view, which draws neither, it runs solid ring
 * to solid ring. Null until both rings are on the canvas.
 */
export function ownerLink({
  owned,
  owner,
  control,
  port,
  compact,
}: {
  owned: RingAt | undefined;
  owner: RingAt | undefined;
  // Where the owned noun's possessor control sits, and the owner's port toward it.
  control: Pt | undefined;
  port: Pt | undefined;
  compact: boolean;
}): PossessionLink | null {
  if (!owned || !owner) return null;
  const edge = (r: RingAt, radius: number, toward: Pt) => onCircle(r.center, radius, angleTo(r.center, toward));
  if (compact) return midpoint(edge(owned, owned.rIn, owner.center), edge(owner, owner.rIn, owned.center));
  return midpoint(
    control ?? edge(owned, owned.rOut, owner.center),
    port ?? edge(owner, owner.rOut, owned.center),
  );
}

/**
 * Where the dashed line from a noun to the noun it points to bows through — the control point of its
 * curve. The line can be long and the rings a period lays in a row sit between its ends, so it bows
 * below them (to the right, when the two rings stand one above the other), further the longer it is.
 * Worked out from the rings' centres alone, so the possessor control can face it before it is seated.
 */
export function pointerBend(ownedCenter: Pt, antecedentCenter: Pt): Pt {
  const dx = antecedentCenter.x - ownedCenter.x;
  const dy = antecedentCenter.y - ownedCenter.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return ownedCenter;
  // The unit normal on the downward side (the rightward one, for a vertical line).
  let nx = -dy / length;
  let ny = dx / length;
  if (ny < 0 || (Math.abs(ny) < 1e-9 && nx < 0)) {
    nx = -nx;
    ny = -ny;
  }
  const bulge = Math.min(0.45 * length, 180);
  return {
    x: (ownedCenter.x + antecedentCenter.x) / 2 + nx * bulge,
    y: (ownedCenter.y + antecedentCenter.y) / 2 + ny * bulge,
  };
}

/**
 * The dashed line from a noun to the noun it points to as its owner, bowed through `pointerBend`: from
 * its possessor control (its solid ring, in compact view) to the edge of the antecedent's ring, each
 * end facing the bend. Its midpoint is the top of the curve, where the pronoun chip sits clear of the
 * rings between. Null until both rings are drawn.
 */
export function pointerLink({
  owned,
  antecedent,
  control,
  compact,
}: {
  owned: RingAt | undefined;
  antecedent: RingAt | undefined;
  control: Pt | undefined;
  compact: boolean;
}): PossessionLink | null {
  if (!owned || !antecedent) return null;
  const via = pointerBend(owned.center, antecedent.center);
  const from = compact || !control
    ? onCircle(owned.center, compact ? owned.rIn : owned.rOut, angleTo(owned.center, via))
    : control;
  const to = onCircle(antecedent.center, compact ? antecedent.rIn : antecedent.rOut, angleTo(antecedent.center, via));
  // A quadratic curve's point halfway along: a quarter of each end, half of its control point.
  const mid = { x: (from.x + to.x) / 4 + via.x / 2, y: (from.y + to.y) / 4 + via.y / 2 };
  return { from, to, mid, via };
}
