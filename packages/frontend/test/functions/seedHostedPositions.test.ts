import { describe, expect, it } from 'vitest';
import { belowRing, UNMEASURED_R } from '../../src/components/PhraseBuilder/conjunctChain.ts';
import { besideRing } from '../../src/components/PhraseBuilder/ownerChain.ts';
import { BUTTON_HALF, type Pt } from '../../src/components/PhraseBuilder/ringLayout.ts';
import { BOTTOM_MARGIN } from '../../src/components/PhraseBuilder/overlap.ts';
import { DEFAULT_POSITIONS } from '../../src/components/PhraseBuilder/slots.ts';
import { seedHostedPositions } from '../../src/components/PhraseBuilder/functions/seedHostedPositions.ts';

const CANVAS = { w: 600, h: 400 };
const percent = (c: Pt): Pt => ({ x: (c.x / CANVAS.w) * 100, y: (c.y / CANVAS.h) * 100 });
const px = (p: Pt): Pt => ({ x: (p.x / 100) * CANVAS.w, y: (p.y / 100) * CANVAS.h });
// How far down a ring seeded at centre `c` reaches, as the canvas has to hold it.
const reach = (c: Pt) => c.y + UNMEASURED_R + BUTTON_HALF + BOTTOM_MARGIN;

const seed = (over: Partial<Parameters<typeof seedHostedPositions>[0]> = {}) =>
  seedHostedPositions({
    chains: [],
    owners: [],
    positions: {},
    groupRects: [],
    hostedRings: {},
    canvas: CANVAS,
    ...over,
  });

describe('seedHostedPositions', () => {
  it('seeds nothing on a canvas with no hosted rings', () => {
    expect(seed()).toEqual({ seeds: {}, bottom: 0 });
  });

  it('seeds nothing for a ring that already has a place', () => {
    expect(
      seed({
        chains: [{ which: 'subject', count: 1 }],
        owners: [{ address: 'subject/possessor', possessedKey: 'subject' }],
        positions: { 'subject+1': { x: 10, y: 10 }, 'subject/possessor': { x: 90, y: 10 } },
      }),
    ).toEqual({ seeds: {}, bottom: 0 });
  });

  it('puts a first conjunct below its head, clear of how far the head’s ring reaches', () => {
    const { seeds, bottom } = seed({
      chains: [{ which: 'subject', count: 1 }],
      positions: { subject: { x: 50, y: 25 } },
      groupRects: [{ mainKey: 'subject', rOut: 90 }],
    });

    const c = belowRing({ x: 300, y: 100 }, 90);
    expect(seeds).toEqual({ 'subject+1': percent(c) });
    expect(bottom).toBe(reach(c));
  });

  it('places a head without a stored place from where it starts out', () => {
    const { seeds } = seed({ chains: [{ which: 'directObject', count: 1 }] });

    expect(seeds['directObject+1']).toEqual(percent(belowRing(px(DEFAULT_POSITIONS.directObject), UNMEASURED_R)));
  });

  it('lands a whole new chain in one pass, each ring below the one seeded before it', () => {
    const { seeds, bottom } = seed({
      chains: [{ which: 'subject', count: 2 }],
      positions: { subject: { x: 50, y: 10 } },
      hostedRings: { 'subject+1': { rOut: 40 } },
    });

    const first = belowRing({ x: 300, y: 40 }, UNMEASURED_R);
    const second = belowRing(first, 40);
    expect(seeds['subject+1']).toEqual(percent(first));
    expect(seeds['subject+2'].x).toBeCloseTo(percent(second).x);
    expect(seeds['subject+2'].y).toBeCloseTo(percent(second).y);
    expect(bottom).toBeCloseTo(reach(second));
  });

  it('puts an owner below and beside the ring it owns', () => {
    const { seeds } = seed({
      owners: [{ address: 'directObject/possessor', possessedKey: 'directObject' }],
      positions: { directObject: { x: 80, y: 30 } },
      groupRects: [{ mainKey: 'directObject', rOut: 70 }],
    });

    expect(seeds).toEqual({
      'directObject/possessor': percent(besideRing({ x: 480, y: 120 }, 70, CANVAS.w)),
    });
  });

  it('puts an owner beside a conjunct seeded in the same pass, and an owner’s owner beside that', () => {
    const { seeds } = seed({
      chains: [{ which: 'subject', count: 1 }],
      owners: [
        { address: 'subject/conjunct/0/possessor', possessedKey: 'subject+1' },
        { address: 'subject/conjunct/0/possessor/possessor', possessedKey: 'subject/conjunct/0/possessor' },
      ],
      positions: { subject: { x: 20, y: 10 } },
    });

    const conjunct = belowRing({ x: 120, y: 40 }, UNMEASURED_R);
    const owner = besideRing(px(seeds['subject+1']), UNMEASURED_R, CANVAS.w);
    expect(seeds['subject+1']).toEqual(percent(conjunct));
    expect(seeds['subject/conjunct/0/possessor']).toEqual(percent(owner));
    expect(seeds['subject/conjunct/0/possessor/possessor']).toEqual(
      percent(besideRing(px(seeds['subject/conjunct/0/possessor']), UNMEASURED_R, CANVAS.w)),
    );
  });

  it('skips an owner whose ring has nowhere to be placed beside', () => {
    expect(seed({ owners: [{ address: 'x/possessor', possessedKey: 'x' }] }).seeds).toEqual({});
  });
});
