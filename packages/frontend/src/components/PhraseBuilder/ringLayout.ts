// Ring geometry for one constituent on the phrase canvas. A word sits inside a solid ring that
// carries the controls about the word; its revealed satellites orbit outside that ring; and a
// dotted ring round the orbit carries the controls about the phrase and its links.
//
// The radii are chosen so three bands never overlap, at any angle: the solid ring's controls
// occupy `rIn ± BUTTON_HALF`, the satellite discs (and the chain controls between them) occupy
// `orbit ± band`, and the dotted ring's controls occupy `rOut ± BUTTON_HALF`. A control can then
// only ever meet another control on its own ring, and each ring spreads its controls apart along
// its circumference — so nothing on a constituent can land on anything else.
//
// Positions on a circle are one number, an arc length, which is what lets every ring share one
// spreading rule (spreadOnLoop). Angles are screen angles: 0 points right, and they grow
// clockwise, since the canvas's y axis points down.

export type Pt = { x: number; y: number };
export type Size = { w: number; h: number };

const TAU = Math.PI * 2;

export const BUTTON_HALF = 10;
// The key badge a control wears while the cursor rests on the box it belongs to: a square of this
// side, seated on the button's bottom-right corner with this much of itself hanging past it. The
// badge is drawn by KeyTip, which reads both numbers from here — the ring has to leave room for
// something this size, so the size is the ring's business as much as the badge's.
export const BADGE_SIZE = 15;
export const BADGE_OVERHANG = 0.55;
// How far the badge's far corner reaches from the centre of the button it labels.
const BADGE_REACH = Math.SQRT2 * (BUTTON_HALF + BADGE_SIZE * BADGE_OVERHANG);
// A control is more than its button: neighbours on a ring sit this far apart along it, so that a
// control's badge stops short of the next control's button rather than landing on it. Sizing the
// gap for the badge rather than the button is what keeps a ring that carries six controls — a
// verb's tense, aspect, modal, adverb, polarity and clear — from ringing the word in a wall of
// them, since the ring grows until what it carries fits (see INNER_FILL / OUTER_FILL).
export const CONTROL_GAP = BADGE_REACH + BUTTON_HALF;
// Clear space between a control band and the satellite band.
const BAND_CLEAR = 4;
// How far a solid-ring control stays clear of the text it surrounds, at the text's corners.
const TEXT_CLEAR = 2;
// The smallest solid ring, so a one-letter word still seats its controls.
export const RING_MIN = 34;
// A satellite disc's padding round its text, and its smallest radius. A disc's clear button sits
// on its rim at half past one; below this radius the button would reach out of the orbit band.
const DISC_PAD = 5;
export const DISC_MIN = 18;
// The arc between two chained discs: room for the control that revealed the second one — the same
// arc that control would reserve on a ring, so it keeps its badge clear of both discs.
export const CHAIN_ROOM = CONTROL_GAP;
// Clear arc between two discs that don't share a chain.
const DISC_CLEAR = 6;
// The orbit widens before its discs would fill more than this share of it, so a long chain never
// falls back to being dealt evenly round the whole ring (which would move every disc).
const ORBIT_FILL = 0.85;
// Clear space between the solid ring's controls and the dotted ring's when nothing orbits between.
const HALO = 6;
// Controls sharing a gap stack across the orbit, LANE_SPACING apart and centred on it: a pair sits
// LANE_OFFSET either side, a third takes the orbit itself. The band has to be deep enough to hold
// the outermost lane and its button, which is what `laneBand` works out.
const LANE_OFFSET = 11;
const LANE_SPACING = 2 * LANE_OFFSET;
const STACKED_BAND = 22;

/** Where lane `i` of `n` sits, relative to the orbit: one lane rides it, the rest spread evenly. */
const laneShift = (i: number, n: number) => (n === 1 ? 0 : (i - (n - 1) / 2) * LANE_SPACING);

/** How deep a band a gap of `n` controls needs — the outermost lane, plus the room a pair keeps. */
const laneBand = (n: number) => (n <= 1 ? 0 : ((n - 1) / 2) * LANE_SPACING + (STACKED_BAND - LANE_OFFSET));
// The solid ring spreads its controls over at most this share of its circumference before it grows.
const INNER_FILL = 0.8;
// The dotted ring seats its controls in at most half its circumference before it grows.
const OUTER_FILL = 0.5;

/** The screen angle of an hour on a clock face: 12 points up, 3 right. */
export const clock = (hour: number): number => (hour / 12) * TAU - Math.PI / 2;

const wrap = (a: number) => ((a % TAU) + TAU) % TAU;

/** A canvas point in px as % of the canvas. A canvas not measured yet counts as 1px across. */
export const toPercent = (p: Pt, size: Size): Pt => ({
  x: (p.x / Math.max(size.w, 1)) * 100,
  y: (p.y / Math.max(size.h, 1)) * 100,
});

/** A canvas point in % of the canvas as px. */
export const toPx = (p: Pt, size: Size): Pt => ({ x: (p.x / 100) * size.w, y: (p.y / 100) * size.h });

export const angleTo = (from: Pt, to: Pt): number => Math.atan2(to.y - from.y, to.x - from.x);

export const onCircle = (center: Pt, r: number, a: number): Pt => ({
  x: center.x + r * Math.cos(a),
  y: center.y + r * Math.sin(a),
});

/** The solid ring round a word's content: clear of the text's corners by a control's half-width. */
export const innerRadius = (content: Size): number =>
  Math.max(RING_MIN, Math.hypot(content.w / 2, content.h / 2) + TEXT_CLEAR + BUTTON_HALF);

/** The disc round a satellite's content. */
export const discRadius = (content: Size): number =>
  Math.max(DISC_MIN, Math.hypot(content.w / 2, content.h / 2) + DISC_PAD);

// ── Spreading ──────────────────────────────────────────────────────────────────

/** Something to seat on a loop: it aims at `s` and occupies `[s - before, s + after]`. */
export type Span = { s: number; before: number; after: number };

// Spread spans on a closed loop of `length` so neighbours keep at least `clear` apart, moving each
// as little as it can: a run that crowds one stretch is centred on where its members aimed, and
// they keep the order they aimed in. Each span's `s` must lie in [0, length).
export function spreadOnLoop<T extends Span>(
  spans: readonly T[],
  length: number,
  clear: number,
): { item: T; s: number }[] {
  const n = spans.length;
  if (n === 0) return [];
  const sorted = [...spans].sort((a, b) => a.s - b.s);
  const extent = (t: T) => t.before + t.after + clear;
  const total = sorted.reduce((sum, t) => sum + extent(t), 0);
  if (total >= length) {
    // More than the loop can hold: pack them edge to edge in aimed order, shrunk to fit.
    const scale = length / total;
    let cursor = sorted[0].s - sorted[0].before * scale;
    return sorted.map((t) => {
      const s = cursor + t.before * scale;
      cursor += extent(t) * scale;
      return { item: t, s };
    });
  }

  // Cut the loop open at its widest free stretch, so every run that needs spreading is contiguous
  // in the unrolled order.
  let cut = 0;
  let widest = -Infinity;
  for (let i = 0; i < n; i++) {
    const next = i + 1 < n ? sorted[i + 1] : { ...sorted[0], s: sorted[0].s + length };
    const free = next.s - next.before - (sorted[i].s + sorted[i].after);
    if (free > widest) {
      widest = free;
      cut = (i + 1) % n;
    }
  }
  type Member = { item: T; s: number };
  let order: Member[] = [...sorted.slice(cut), ...sorted.slice(0, cut)].map((item, i) => ({
    item,
    s: i < n - cut ? item.s : item.s + length,
  }));

  // A run of members laid edge to edge: `offsets` from the first member's centre, `x` that centre.
  type Run = { members: Member[]; offsets: number[]; x: number };
  const makeRun = (members: Member[]): Run => {
    const offsets = [0];
    for (let i = 1; i < members.length; i++) {
      offsets.push(offsets[i - 1] + members[i - 1].item.after + clear + members[i].item.before);
    }
    // The shift that moves the run's members, on average, least from where they aimed.
    const x = members.reduce((sum, m, i) => sum + m.s - offsets[i], 0) / members.length;
    return { members, offsets, x };
  };
  const start = (r: Run) => r.x - r.members[0].item.before;
  const end = (r: Run) => r.x + r.offsets[r.offsets.length - 1] + r.members[r.members.length - 1].item.after;

  for (let pass = 0; pass <= 2 * n + 1; pass++) {
    const runs: Run[] = [];
    for (const m of order) {
      let run = makeRun([m]);
      // Merge with each run it crowds, re-centring the merged run on where its members aimed.
      while (runs.length > 0 && start(run) < end(runs[runs.length - 1]) + clear) {
        run = makeRun([...runs.pop()!.members, ...run.members]);
      }
      runs.push(run);
    }
    const first = runs[0];
    const last = runs[runs.length - 1];
    if (runs.length > 1 && end(last) + clear > start(first) + length) {
      // The last run grew round the loop into the first: roll it to the front and merge again.
      order = [
        ...last.members.map((m) => ({ ...m, s: m.s - length })),
        ...runs.slice(0, -1).flatMap((r) => r.members),
      ];
      continue;
    }
    return runs.flatMap((r) => r.members.map((m, i) => ({ item: m.item, s: r.x + r.offsets[i] })));
  }
  return sorted.map((t) => ({ item: t, s: t.s }));
}

// ── Rings ──────────────────────────────────────────────────────────────────────

/**
 * Which way a control faces from the centre of its ring: a fixed hour on a clock face, a point on
 * the canvas (another ring it links to), or a satellite disc — the disc's angle while it is shown,
 * its home hour while it is not.
 */
export type RingAim = { clock: number } | { point: Pt } | { disc: string; home: number };

export type RingControl = {
  key: string;
  aim: RingAim;
  // Half the arc the control takes up on its ring. A control button by default; a port is smaller.
  half?: number;
};

/** A chain of satellites that grows along the orbit from its first member. */
export type OrbitChain = {
  // The hour its first disc sits at, and which way round the clock the chain grows (1 = clockwise).
  home: number;
  dir: 1 | -1;
  // The chain's discs that are shown, in chain order.
  discs: string[];
};

/** A control riding the orbit in the gap after one disc: the control that reveals the next disc. */
export type GapControl = { key: string; after: string };

export type RingSpec = {
  // Satellites that orbit on their own, at a home hour.
  satellites: { key: string; home: number }[];
  chains: OrbitChain[];
  inner: RingControl[];
  gaps: GapControl[];
  outer: RingControl[];
};

export type Disc = { x: number; y: number; r: number; a: number };

export type Ring = {
  center: Pt;
  rIn: number;
  orbit: number;
  // Half the depth of the satellite band: its discs and chain controls stay within orbit ± band.
  band: number;
  rOut: number;
  discs: Record<string, Disc>;
  // Where every control on the ring sits — solid ring, gaps and dotted ring alike — keyed by its key.
  controls: Record<string, Pt>;
};

// One item seated round the orbit: a lone disc, or a whole chain laid out as one rigid run.
type OrbitItem = Span & {
  // The hour it aims at: a chain's first disc, or a lone disc.
  home: number;
  place: (s: number, orbit: number, out: Pick<Ring, "discs" | "controls">) => void;
};

/**
 * Lay out one constituent round `center`: its solid ring from the size of its word, the orbit its
 * shown satellites need, the dotted ring outside that, and every control on all three.
 */
export function layoutRing(
  center: Pt,
  spec: RingSpec,
  sizeOf: (key: string) => Size,
  coreKey: string,
): Ring {
  const halfOf = (c: RingControl) => c.half ?? CONTROL_GAP / 2;
  const innerSpan = spec.inner.reduce((sum, c) => sum + 2 * halfOf(c), 0);
  const rIn = Math.max(innerRadius(sizeOf(coreKey)), innerSpan / (TAU * INNER_FILL));

  // Every shown disc, with its radius.
  const radius: Record<string, number> = {};
  for (const s of spec.satellites) radius[s.key] = discRadius(sizeOf(s.key));
  for (const chain of spec.chains) for (const k of chain.discs) radius[k] = discRadius(sizeOf(k));
  const discKeys = Object.keys(radius);

  // The gaps, and how many controls each holds: two in one gap stack across the orbit.
  const gapsAfter = new Map<string, string[]>();
  for (const g of spec.gaps) {
    if (!(g.after in radius)) continue;
    gapsAfter.set(g.after, [...(gapsAfter.get(g.after) ?? []), g.key]);
  }
  const lanes = Math.max(1, ...[...gapsAfter.values()].map((keys) => keys.length));
  const band = Math.max(0, ...discKeys.map((k) => radius[k]), laneBand(lanes));

  // Lay each chain out along its own arc: member i sits `offset[i]` from the first, in the chain's
  // direction; the gap after a disc is widened to seat the control it holds.
  const items: OrbitItem[] = [];
  for (const chain of spec.chains) {
    if (chain.discs.length === 0) continue;
    const offsets = [0];
    for (let i = 1; i < chain.discs.length; i++) {
      const prev = chain.discs[i - 1];
      const room = gapsAfter.has(prev) ? CHAIN_ROOM : DISC_CLEAR;
      offsets.push(offsets[i - 1] + radius[prev] + room + radius[chain.discs[i]]);
    }
    const last = chain.discs[chain.discs.length - 1];
    const reach = offsets[offsets.length - 1] + radius[last] + (gapsAfter.has(last) ? CHAIN_ROOM : 0);
    const lead = radius[chain.discs[0]];
    items.push({
      s: 0,
      home: chain.home,
      before: chain.dir > 0 ? lead : reach,
      after: chain.dir > 0 ? reach : lead,
      place: (s, orbit, out) => {
        const at = (arc: number) => onCircle(center, orbit, arc / orbit);
        chain.discs.forEach((k, i) => {
          const arc = s + chain.dir * offsets[i];
          out.discs[k] = { ...at(arc), r: radius[k], a: wrap(arc / orbit) };
          const gap = gapsAfter.get(k);
          if (!gap) return;
          const mid = arc + chain.dir * (radius[k] + CHAIN_ROOM / 2);
          const a = mid / orbit;
          gap.forEach((key, lane) => {
            // A lone control rides the orbit itself; several spread across it, the first inside.
            out.controls[key] = onCircle(center, orbit + laneShift(lane, gap.length), a);
          });
        });
      },
    });
  }
  for (const sat of spec.satellites) {
    const r = radius[sat.key];
    const item: OrbitItem = {
      s: 0,
      before: r,
      after: r,
      home: sat.home,
      place: (s, orbit, out) => {
        out.discs[sat.key] = { ...onCircle(center, orbit, s / orbit), r, a: wrap(s / orbit) };
      },
    };
    items.push(item);
  }

  const totalArc = items.reduce((sum, it) => sum + it.before + it.after + DISC_CLEAR, 0);
  const orbit =
    items.length === 0
      ? rIn
      : Math.max(rIn + BUTTON_HALF + BAND_CLEAR + band, totalArc / (TAU * ORBIT_FILL));

  const outerSpan = spec.outer.reduce((sum, c) => sum + 2 * halfOf(c), 0);
  const rOut = Math.max(
    items.length === 0
      ? rIn + 2 * BUTTON_HALF + HALO
      : orbit + band + BAND_CLEAR + BUTTON_HALF,
    outerSpan / (TAU * OUTER_FILL),
  );

  const ring: Ring = { center, rIn, orbit, band, rOut, discs: {}, controls: {} };

  if (items.length > 0) {
    const length = TAU * orbit;
    for (const it of items) it.s = wrap(clock(it.home)) * orbit;
    for (const { item, s } of spreadOnLoop(items, length, DISC_CLEAR)) item.place(s, orbit, ring);
  }

  const facing = (aim: RingAim): number => {
    if ("clock" in aim) return clock(aim.clock);
    if ("point" in aim) return angleTo(center, aim.point);
    const disc = ring.discs[aim.disc];
    return disc ? disc.a : clock(aim.home);
  };
  const seat = (r: number, controls: RingControl[]) => {
    // Spans are measured along the ring, but what has to clear between two controls is the straight
    // line between them — the chord, which is shorter than its arc, and much shorter on a small
    // ring. So each control reserves the arc whose chord is its own half, which puts neighbours
    // exactly `2 * halfOf` apart on the canvas however tight the ring.
    const arcHalf = (half: number) => (half >= r ? (Math.PI / 2) * r : r * Math.asin(half / r));
    const spans = controls.map((c) => ({
      key: c.key,
      s: wrap(facing(c.aim)) * r,
      before: arcHalf(halfOf(c)),
      after: arcHalf(halfOf(c)),
    }));
    for (const { item, s } of spreadOnLoop(spans, TAU * r, 0)) {
      ring.controls[item.key] = onCircle(center, r, s / r);
    }
  };
  seat(rIn, spec.inner);
  seat(rOut, spec.outer);
  return ring;
}

/** The square a ring and the controls straddling its dotted edge take up on the canvas. */
export const ringFootprint = (center: Pt, rOut: number) => {
  const half = rOut + BUTTON_HALF + 1;
  return { x: center.x - half, y: center.y - half, width: 2 * half, height: 2 * half };
};
