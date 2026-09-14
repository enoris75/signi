import { describe, expect, it } from 'vitest';
import { belowRing, UNMEASURED_R, type HostedRing } from '../../src/components/PhraseBuilder/conjunctChain.ts';
import { besideRing } from '../../src/components/PhraseBuilder/ownerChain.ts';
import { DEFAULT_POSITIONS } from '../../src/components/PhraseBuilder/slots.ts';
import type { Pt } from '../../src/components/PhraseBuilder/ringLayout.ts';
import { ringLookup, wordPlacement } from '../../src/components/PhraseBuilder/functions/canvasGeometry.ts';

const GRAPH = { w: 600, h: 400 };
const percent = (c: Pt): Pt => ({ x: (c.x / GRAPH.w) * 100, y: (c.y / GRAPH.h) * 100 });

const place = (over: Partial<Parameters<typeof wordPlacement>[0]> = {}) =>
  wordPlacement({
    at: undefined,
    compactPositions: undefined,
    positions: {},
    graphSize: GRAPH,
    chains: [],
    owners: [],
    ...over,
  });

describe('wordPlacement', () => {
  it('puts a word where it was put, else where it starts out', () => {
    const { wordPos } = place({ positions: { verb: { x: 10, y: 20 } } });

    expect(wordPos('verb')).toEqual({ x: 10, y: 20 });
    expect(wordPos('subject')).toEqual(DEFAULT_POSITIONS.subject);
  });

  it('prefers the compact packing to the stored place, and a host’s place to both', () => {
    const positions = { subject: { x: 10, y: 20 } };
    const compactPositions = { subject: { x: 30, y: 40 } };

    expect(place({ positions, compactPositions }).wordPos('subject')).toEqual({ x: 30, y: 40 });
    expect(place({ positions, compactPositions, at: { x: 5, y: 6 } }).wordPos('subject')).toEqual({ x: 5, y: 6 });
  });

  it('answers the centre in canvas px', () => {
    const { centerOf } = place({ positions: { subject: { x: 25, y: 50 } } });

    expect(centerOf('subject')).toEqual({ x: 150, y: 200 });
  });

  it('starts an unplaced conjunct straight below the ring before it in its group', () => {
    const { wordPos, centerOf } = place({
      positions: { subject: { x: 50, y: 20 } },
      chains: [{ which: 'subject', count: 2 }],
    });

    const first = percent(belowRing({ x: 300, y: 80 }, UNMEASURED_R));
    expect(wordPos('subject+1')).toEqual(first);
    expect(wordPos('subject+2')).toEqual(percent(belowRing(centerOf('subject+1'), UNMEASURED_R)));
  });

  it('starts an unplaced owner below and beside the ring it owns', () => {
    const { wordPos } = place({
      positions: { directObject: { x: 80, y: 30 } },
      owners: [{ address: 'directObject/possessor', possessedKey: 'directObject' }],
    });

    expect(wordPos('directObject/possessor')).toEqual(
      percent(besideRing({ x: 480, y: 120 }, UNMEASURED_R, GRAPH.w)),
    );
  });

  it('keeps a hosted ring where it was put once it has a place', () => {
    const { wordPos } = place({
      positions: { 'subject+1': { x: 70, y: 70 } },
      chains: [{ which: 'subject', count: 1 }],
    });

    expect(wordPos('subject+1')).toEqual({ x: 70, y: 70 });
  });

  it('centres a key nothing places', () => {
    expect(place().wordPos('nowhere')).toEqual({ x: 50, y: 50 });
  });
});

describe('ringLookup', () => {
  const SUBJECT = { mainKey: 'subject', center: { x: 100, y: 100 }, rIn: 30, rOut: 60 };
  const CONJUNCT: HostedRing = { rIn: 20, orbit: 35, rOut: 50, ports: { 'subject/possessor-control': { x: 5, y: -7 } } };
  const lookup = ringLookup({
    groupRects: [SUBJECT],
    hostedRings: { 'subject+1': CONJUNCT },
    controlPos: { seated: { x: 1, y: 2 } },
    centerOf: (key) => (key === 'subject+1' ? { x: 300, y: 200 } : { x: 0, y: 0 }),
  });

  it('answers the canvas’s own constituent’s ring', () => {
    expect(lookup.ringOf('subject')).toBe(SUBJECT);
  });

  it('answers a hosted ring as reported, centred where the canvas puts it', () => {
    expect(lookup.ringOf('subject+1')).toEqual({ center: { x: 300, y: 200 }, rIn: 20, rOut: 50 });
    expect(lookup.ringOf('subject+2')).toBeUndefined();
  });

  it('answers a control seated on the canvas’s own rings', () => {
    expect(lookup.controlOn('subject', 'seated')).toEqual({ x: 1, y: 2 });
  });

  it('answers a hosted ring’s control at its reported offset, by the key its own builder uses', () => {
    expect(lookup.controlOn('subject+1', 'subject+1/possessor-control', 'subject/possessor-control')).toEqual({
      x: 305,
      y: 193,
    });
    expect(lookup.controlOn('subject+1', 'subject+1/possessor-control')).toBeUndefined();
    expect(lookup.controlOn('subject+2', 'anything')).toBeUndefined();
  });
});
