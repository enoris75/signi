import { describe, expect, it } from 'vitest';
import {
  BADGE_OVERHANG,
  BADGE_SIZE,
  BUTTON_HALF,
  CHAIN_ROOM,
  clock,
  innerRadius,
  layoutRing,
  spreadOnLoop,
  toPercent,
  toPx,
  type Ring,
  type RingSpec,
  type Size,
} from '../src/components/PhraseBuilder/ringLayout.ts';

type Pt = { x: number; y: number };

const CENTER = { x: 400, y: 300 };
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const SLACK = 0.5;
const TAU = Math.PI * 2;

// Sizes of the content each node measures at: a labelled noun, and one-word satellites.
const SIZES: Record<string, Size> = {
  subject: { w: 64, h: 32 },
  verb: { w: 26, h: 20 },
  brown: { w: 34, h: 16 },
  big: { w: 20, h: 16 },
  old: { w: 20, h: 16 },
  lazy: { w: 28, h: 16 },
  the: { w: 22, h: 16 },
  must: { w: 30, h: 16 },
  can: { w: 22, h: 16 },
  want: { w: 32, h: 16 },
  probably: { w: 56, h: 16 },
};
const sizeOf = (key: string) => SIZES[key] ?? { w: 40, h: 16 };

const spec = (partial: Partial<RingSpec>): RingSpec => ({
  satellites: [],
  chains: [],
  inner: [],
  gaps: [],
  outer: [],
  ...partial,
});

// Every control and disc on a ring, and the one invariant the ring layout exists for: nothing
// covers anything else — not a control its word, a control a disc, nor two controls each other.
function expectNothingOverlaps(ring: Ring, coreKey: string) {
  const text = sizeOf(coreKey);
  const corner = Math.hypot(text.w / 2, text.h / 2);
  const controls = Object.entries(ring.controls);
  const discs = Object.entries(ring.discs);
  for (const [key, c] of controls) {
    expect(dist(c, ring.center), `${key} clears the word`).toBeGreaterThanOrEqual(corner + BUTTON_HALF - SLACK);
    for (const [disc, d] of discs) {
      expect(dist(c, d), `${key} clears disc ${disc}`).toBeGreaterThanOrEqual(d.r + BUTTON_HALF - SLACK);
    }
  }
  for (let i = 0; i < controls.length; i++) {
    for (let j = i + 1; j < controls.length; j++) {
      const [a, pa] = controls[i];
      const [b, pb] = controls[j];
      expect(dist(pa, pb), `${a} clears ${b}`).toBeGreaterThanOrEqual(2 * BUTTON_HALF - SLACK);
    }
  }
  for (let i = 0; i < discs.length; i++) {
    for (let j = i + 1; j < discs.length; j++) {
      const [a, da] = discs[i];
      const [b, db] = discs[j];
      expect(dist(da, db), `${a} clears ${b}`).toBeGreaterThanOrEqual(da.r + db.r - SLACK);
    }
    const [key, d] = discs[i];
    expect(dist(d, ring.center) - d.r, `${key} clears the solid ring's controls`).toBeGreaterThanOrEqual(ring.rIn + BUTTON_HALF);
    expect(dist(d, ring.center) + d.r, `${key} clears the dotted ring's controls`).toBeLessThanOrEqual(ring.rOut - BUTTON_HALF);
  }
}

describe('spreadOnLoop', () => {
  const span = (s: number, half = 10) => ({ s, before: half, after: half });

  it('leaves spans that already clear each other where they aimed', () => {
    const placed = spreadOnLoop([span(10), span(100)], 400, 4);
    expect(placed.map((p) => p.s)).toEqual([10, 100]);
  });

  it('centres a crowding run on where it aimed, in the order it aimed', () => {
    const placed = spreadOnLoop([span(52, 10), span(50, 10), span(51, 10)], 400, 2);
    const byAim = [...placed].sort((a, b) => a.item.s - b.item.s).map((p) => p.s);
    expect(byAim[1] - byAim[0]).toBeCloseTo(22);
    expect(byAim[2] - byAim[1]).toBeCloseTo(22);
    expect((byAim[0] + byAim[2]) / 2).toBeCloseTo(51);
  });

  it('spaces spans of different widths by their own extents', () => {
    const wide = { s: 100, before: 5, after: 40 };
    const narrow = { s: 110, before: 10, after: 10 };
    const placed = spreadOnLoop([wide, narrow], 1000, 4);
    const w = placed.find((p) => p.item === wide)!.s;
    const n = placed.find((p) => p.item === narrow)!.s;
    expect(n - 10 - (w + 40)).toBeCloseTo(4);
  });

  it('spreads a run across the point where the loop closes', () => {
    const placed = spreadOnLoop([span(398), span(2)], 400, 0);
    const [a, b] = placed.map((p) => ((p.s % 400) + 400) % 400).sort((x, y) => x - y);
    // One sits just past zero, the other just before the end, 20 apart round the seam.
    expect((a + 400 - b) % 400).toBeCloseTo(20);
  });

  it('packs spans edge to edge when the loop is too short for them', () => {
    const placed = spreadOnLoop([span(0), span(0), span(0), span(0)], 60, 0);
    expect(placed).toHaveLength(4);
    const s = placed.map((p) => p.s).sort((x, y) => x - y);
    for (let i = 1; i < s.length; i++) expect(s[i] - s[i - 1]).toBeCloseTo(15);
  });
});

describe('layoutRing', () => {
  it('seats the solid ring clear of the word by a control', () => {
    const ring = layoutRing(CENTER, spec({}), sizeOf, 'subject');
    expect(ring.rIn).toBeCloseTo(innerRadius(SIZES.subject));
    expect(ring.rOut).toBeGreaterThanOrEqual(ring.rIn + 2 * BUTTON_HALF);
  });

  it('puts a lone control on the ray it aims along', () => {
    const ring = layoutRing(CENTER, spec({ inner: [{ key: 'verbNegative', aim: { clock: 6 } }] }), sizeOf, 'verb');
    expect(ring.controls.verbNegative.x).toBeCloseTo(CENTER.x);
    expect(ring.controls.verbNegative.y).toBeCloseTo(CENTER.y + ring.rIn);
  });

  it('keeps a crowded verb clear of its word, its satellites and itself', () => {
    const ring = layoutRing(
      CENTER,
      spec({
        satellites: [
          { key: 'the', home: 11 },
          { key: 'probably', home: 1 },
          { key: 'lazy', home: 4.5 },
        ],
        chains: [{ home: 8.5, dir: -1, discs: ['must', 'can'] }],
        inner: [
          { key: 'verbTense', aim: { disc: 'the', home: 11 } },
          { key: 'verbAspect', aim: { disc: 'probably', home: 1 } },
          { key: 'verbModal', aim: { disc: 'must', home: 8.5 } },
          { key: 'modifier', aim: { disc: 'lazy', home: 4.5 } },
          { key: 'verbNegative', aim: { clock: 7 } },
          { key: 'clear', aim: { clock: 1.5 } },
        ],
        gaps: [{ key: 'verbModal2', after: 'must' }],
        outer: [
          { key: 'collapse', aim: { clock: 10.5 } },
          { key: 'instrumental', aim: { clock: 6.06 } },
          { key: 'manner', aim: { clock: 6.02 } },
          { key: 'locative', aim: { clock: 5.98 } },
          { key: 'cause', aim: { clock: 5.94 } },
          { key: 'port', aim: { point: { x: 0, y: 300 } }, half: 6 },
        ],
      }),
      sizeOf,
      'verb',
    );
    expectNothingOverlaps(ring, 'verb');
  });

  it('leaves room beside every control for the key badge it wears', () => {
    // The six a verb carries — the ones the screenshot of a crowded ring is made of. Each wears its
    // key on its bottom-right corner while the cursor is on the verb, so the ring has to seat them
    // far enough apart that a badge lands beside the next control rather than on it.
    const inner = [
      { key: 'verbTense', aim: { clock: 11 } },
      { key: 'verbAspect', aim: { clock: 1 } },
      { key: 'clear', aim: { clock: 1.5 } },
      { key: 'modifier', aim: { clock: 4.5 } },
      { key: 'verbNegative', aim: { clock: 7 } },
      { key: 'verbModal', aim: { clock: 8.5 } },
    ];
    const ring = layoutRing(CENTER, spec({ inner }), sizeOf, 'verb');
    // How far the badge's far corner reaches from the centre of the button it labels (see KeyTip).
    const reach = Math.SQRT2 * (BUTTON_HALF + BADGE_SIZE * BADGE_OVERHANG);
    for (let i = 0; i < inner.length; i++) {
      for (let j = i + 1; j < inner.length; j++) {
        const a = inner[i].key;
        const b = inner[j].key;
        expect(
          dist(ring.controls[a], ring.controls[b]),
          `${a}'s badge clears ${b}`,
        ).toBeGreaterThanOrEqual(reach + BUTTON_HALF - SLACK);
      }
    }
  });

  it("faces each reveal control toward its satellite's disc", () => {
    const ring = layoutRing(
      CENTER,
      spec({
        satellites: [{ key: 'the', home: 6 }],
        inner: [{ key: 'det', aim: { disc: 'the', home: 6 } }],
      }),
      sizeOf,
      'subject',
    );
    const det = ring.controls.det;
    const disc = ring.discs.the;
    expect(det.x).toBeCloseTo(CENTER.x);
    expect(disc.x).toBeCloseTo(CENTER.x);
    expect(disc.y).toBeGreaterThan(det.y);
  });

  describe('chains', () => {
    const adjectives = (discs: string[], { determiner = true } = {}) =>
      layoutRing(
        CENTER,
        spec({
          satellites: determiner ? [{ key: 'the', home: 6 }] : [],
          chains: [{ home: 12, dir: 1, discs }],
          inner: [{ key: 'adj', aim: { disc: discs[0], home: 12 } }],
          // The control for each next adjective rides the gap after the one before it.
          gaps: discs.map((after, i) => ({ key: `adj${i + 2}`, after })),
        }),
        sizeOf,
        'subject',
      );

    it('starts at its home hour and grows clockwise along the orbit', () => {
      const ring = adjectives(['brown', 'big', 'old']);
      expect(ring.discs.brown.x).toBeCloseTo(CENTER.x);
      expect(ring.discs.brown.y).toBeLessThan(CENTER.y);
      // Three discs reach past 3 o'clock, where the wrapped angle turns over to 0, so each step is
      // measured round the loop from the disc before it rather than by raw angle.
      const clockwiseStep = (from: number, to: number) => ((to - from) % TAU + TAU) % TAU;
      expect(clockwiseStep(ring.discs.brown.a, ring.discs.big.a)).toBeLessThan(Math.PI);
      expect(clockwiseStep(ring.discs.big.a, ring.discs.old.a)).toBeLessThan(Math.PI);
      for (const d of Object.values(ring.discs)) expect(dist(d, CENTER)).toBeCloseTo(ring.orbit);
    });

    it('seats the control for the next member between the two discs', () => {
      const ring = adjectives(['brown', 'big']);
      const control = ring.controls.adj2;
      const { brown, big } = ring.discs;
      expect(dist(control, CENTER)).toBeCloseTo(ring.orbit);
      expect(dist(control, brown)).toBeCloseTo(brown.r + CHAIN_ROOM / 2, 0);
      expect(dist(control, big)).toBeLessThan(dist(brown, big));
      expectNothingOverlaps(ring, 'subject');
    });

    it('never moves the members before the one just revealed', () => {
      // With nothing else on the orbit to run into: a chain that reaches another satellite is
      // spread along with it, which the long-chain test below covers.
      const short = adjectives(['brown', 'big'], { determiner: false });
      const long = adjectives(['brown', 'big', 'old', 'lazy'], { determiner: false });
      expect(long.discs.brown.a).toBeCloseTo(short.discs.brown.a);
      expect(long.discs.big.a).toBeCloseTo(short.discs.big.a);
      expectNothingOverlaps(long, 'subject');
    });

    it('widens the orbit rather than overlapping a long chain', () => {
      const keys = ['brown', 'big', 'old', 'lazy', 'must', 'can', 'want', 'probably'];
      const ring = adjectives(keys);
      expectNothingOverlaps(ring, 'subject');
      const tight = adjectives(['brown']);
      expect(ring.orbit).toBeGreaterThan(tight.orbit);
    });

    it("stacks a modal's adverb control and the next modal's across the gap they share", () => {
      const ring = layoutRing(
        CENTER,
        spec({
          chains: [{ home: 8.5, dir: -1, discs: ['must'] }],
          inner: [{ key: 'verbModal', aim: { disc: 'must', home: 8.5 } }],
          gaps: [
            { key: 'verbModalAdverb', after: 'must' },
            { key: 'verbModal2', after: 'must' },
          ],
        }),
        sizeOf,
        'verb',
      );
      const adverb = dist(ring.controls.verbModalAdverb, CENTER);
      const next = dist(ring.controls.verbModal2, CENTER);
      expect(adverb).toBeLessThan(ring.orbit);
      expect(next).toBeGreaterThan(ring.orbit);
      expect(next - adverb).toBeGreaterThanOrEqual(2 * BUTTON_HALF);
      expectNothingOverlaps(ring, 'verb');
    });

    it('runs anticlockwise when told to, so a modal chain grows away from tense', () => {
      const ring = layoutRing(
        CENTER,
        spec({ chains: [{ home: 8.5, dir: -1, discs: ['must', 'can'] }], gaps: [{ key: 'm2', after: 'must' }] }),
        sizeOf,
        'verb',
      );
      // From 8:30 anticlockwise is downward on the left.
      expect(ring.discs.can.y).toBeGreaterThan(ring.discs.must.y);
      expect(clock(8.5)).toBeCloseTo(ring.discs.must.a);
    });
  });

  it('grows the dotted ring until its controls fit in half of it', () => {
    const outer = Array.from({ length: 16 }, (_, i) => ({ key: `c${i}`, aim: { clock: 6 } }));
    const ring = layoutRing(CENTER, spec({ outer }), sizeOf, 'verb');
    expect(Math.PI * ring.rOut).toBeGreaterThanOrEqual(16 * 2 * (BUTTON_HALF + 1) - SLACK);
    expectNothingOverlaps(ring, 'verb');
  });
});

describe('toPercent / toPx', () => {
  it('turns a canvas point between px and % of the canvas', () => {
    const size = { w: 600, h: 400 };

    expect(toPercent({ x: 150, y: 100 }, size)).toEqual({ x: 25, y: 25 });
    expect(toPx({ x: 25, y: 25 }, size)).toEqual({ x: 150, y: 100 });
  });

  it('reads a canvas not measured yet as 1px across rather than dividing by nothing', () => {
    expect(toPercent({ x: 3, y: 2 }, { w: 0, h: 0 })).toEqual({ x: 300, y: 200 });
  });
});
