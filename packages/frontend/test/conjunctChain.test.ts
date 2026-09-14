import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import {
  belowRing,
  chainKeys,
  chainPortKey,
  CONJUNCT_GAP,
  conjunctKey,
  conjunctLinks,
  dropConjunctPosition,
  hostedRect,
  mergeHostedRing,
  openConjunctsFor,
  sameHostedRing,
  UNMEASURED_R,
  type HostedRing,
} from '../src/components/PhraseBuilder/conjunctChain.ts';
import { BUTTON_HALF } from '../src/components/PhraseBuilder/ringLayout.ts';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });

const PETER = noun('PETER');
const PAUL = noun('PAUL');
const CAT = noun('CAT');
const DOG = noun('DOG');
const FOX = noun('FOX');

const ring = (rOut: number, ports: HostedRing['ports'] = {}): HostedRing => ({
  rIn: rOut - 30,
  orbit: rOut - 20,
  rOut,
  ports,
});

describe('conjunct keys', () => {
  it('names a group’s rings in reading order, the head’s word first', () => {
    expect(conjunctKey('directObject', 0)).toBe('directObject+1');
    expect(chainKeys('subject', 2)).toEqual(['subject', 'subject+1', 'subject+2']);
    expect(chainKeys('subject', 0)).toEqual(['subject']);
  });
});

describe('openConjunctsFor', () => {
  it('lists the coordinable blocks that have a head and at least one conjunct, in order', () => {
    expect(
      openConjunctsFor({
        directObject: CAT,
        directObjectConjuncts: [{ subject: DOG }],
        subject: PETER,
        subjectConjuncts: [{ subject: PAUL }],
      }),
    ).toEqual(['subject', 'directObject']);
  });

  it('skips a block whose conjunct list is empty', () => {
    expect(openConjunctsFor({ subject: PETER, subjectConjuncts: [] })).toEqual([]);
  });

  it('skips conjuncts left behind by a cleared head', () => {
    expect(openConjunctsFor({ subjectConjuncts: [{ subject: PAUL }] })).toEqual([]);
  });

  it('covers the predicative subject complement', () => {
    expect(openConjunctsFor({ predicative: FOX, predicativeConjuncts: [{}] })).toEqual(['predicative']);
  });
});

describe('belowRing', () => {
  it('starts a ring straight below the one before it, a chip’s gap clear of both', () => {
    const at = belowRing({ x: 100, y: 50 }, 80, 60);

    expect(at).toEqual({ x: 100, y: 50 + 80 + CONJUNCT_GAP + 2 * BUTTON_HALF + 60 });
  });

  it('allows for a ring not measured yet', () => {
    expect(belowRing({ x: 0, y: 0 }, 0).y).toBe(CONJUNCT_GAP + 2 * BUTTON_HALF + UNMEASURED_R);
  });
});

describe('hostedRect', () => {
  const args = {
    key: 'subject+2',
    color: '#123',
    kind: 'conjunct' as const,
    head: 'Subject',
    index: 1,
    center: { x: 200, y: 300 },
    ring: ring(90),
  };

  it('is a constituent of its own whose only node is its key, marked as its head’s conjunct', () => {
    const rect = hostedRect({ ...args, compact: false });

    expect(rect).toMatchObject({
      label: 'subject+2',
      mainKey: 'subject+2',
      nodeKeys: ['subject+2'],
      color: '#123',
      conjunct: { head: 'Subject', index: 1 },
      center: { x: 200, y: 300 },
      rOut: 90,
    });
    expect(rect.width).toBeCloseTo(2 * (90 + BUTTON_HALF + 1));
    expect(rect.x).toBeCloseTo(200 - rect.width / 2);
  });

  it('takes up only its solid ring in compact view', () => {
    expect(hostedRect({ ...args, compact: true }).width).toBeCloseTo(2 * (60 + BUTTON_HALF + 1));
  });

  it('marks an owner’s ring as an owner of its group, not a conjunct standing in for its head', () => {
    const rect = hostedRect({ ...args, key: 'subject/possessor', kind: 'owner', index: -0.5, compact: false });

    expect(rect).toMatchObject({ mainKey: 'subject/possessor', owner: { head: 'Subject', index: -0.5 } });
    expect(rect.conjunct).toBeUndefined();
  });
});

describe('conjunctLinks', () => {
  const CENTERS: Record<string, { x: number; y: number }> = {
    subject: { x: 100, y: 100 },
    'subject+1': { x: 100, y: 400 },
    'subject+2': { x: 400, y: 400 },
  };
  const centerOf = (key: string) => CENTERS[key];
  const headRing = () => ({ rIn: 40, rOut: 70 });

  it('runs port to port: the head’s from its own layout, a conjunct’s from where it reported', () => {
    const links = conjunctLinks({
      chains: [{ which: 'subject', count: 2 }],
      centerOf,
      headRing,
      headPort: (port) => (port === chainPortKey('subject', 'subject+1') ? { x: 102, y: 170 } : undefined),
      rings: {
        'subject+1': ring(80, {
          [chainPortKey('subject+1', 'subject')]: { x: 0, y: -80 },
          [chainPortKey('subject+1', 'subject+2')]: { x: 80, y: 0 },
        }),
        'subject+2': ring(60, { [chainPortKey('subject+2', 'subject+1')]: { x: -60, y: 0 } }),
      },
      compact: false,
    });

    expect(links).toEqual([
      { which: 'subject', index: 0, from: { x: 102, y: 170 }, to: { x: 100, y: 320 }, mid: { x: 101, y: 245 } },
      { which: 'subject', index: 1, from: { x: 180, y: 400 }, to: { x: 340, y: 400 }, mid: { x: 260, y: 400 } },
    ]);
  });

  it('falls back to the dotted ring’s edge, facing the other ring, while a port is not seated', () => {
    const [link] = conjunctLinks({
      chains: [{ which: 'subject', count: 1 }],
      centerOf,
      headRing,
      headPort: () => undefined,
      rings: { 'subject+1': ring(80) },
      compact: false,
    });

    expect(link.from.x).toBeCloseTo(100);
    expect(link.from.y).toBeCloseTo(170);
    expect(link.to.x).toBeCloseTo(100);
    expect(link.to.y).toBeCloseTo(320);
  });

  it('joins solid ring to solid ring in compact view', () => {
    const [link] = conjunctLinks({
      chains: [{ which: 'subject', count: 1 }],
      centerOf,
      headRing,
      headPort: () => ({ x: 0, y: 0 }),
      rings: { 'subject+1': ring(80) },
      compact: true,
    });

    expect(link.from.y).toBeCloseTo(140);
    expect(link.to.y).toBeCloseTo(350);
  });

  it('leaves a link out until both of its rings have been drawn', () => {
    expect(
      conjunctLinks({
        chains: [{ which: 'subject', count: 2 }],
        centerOf,
        headRing,
        headPort: () => undefined,
        rings: { 'subject+2': ring(60) },
        compact: false,
      }),
    ).toEqual([]);
    expect(
      conjunctLinks({
        chains: [{ which: 'subject', count: 1 }],
        centerOf,
        headRing: () => undefined,
        headPort: () => undefined,
        rings: { 'subject+1': ring(60) },
        compact: false,
      }),
    ).toEqual([]);
  });
});

describe('dropConjunctPosition', () => {
  it('moves the rings after a removed conjunct one step up the chain, keeping their places', () => {
    const positions = {
      subject: { x: 10, y: 10 },
      'subject+1': { x: 10, y: 40 },
      'subject+2': { x: 30, y: 40 },
      'subject+3': { x: 50, y: 40 },
      'directObject+1': { x: 80, y: 80 },
    };

    expect(dropConjunctPosition(positions, 'subject', 1, 3)).toEqual({
      subject: { x: 10, y: 10 },
      'subject+1': { x: 10, y: 40 },
      'subject+2': { x: 50, y: 40 },
      'directObject+1': { x: 80, y: 80 },
    });
  });

  it('forgets a later ring’s place when it never had one', () => {
    expect(dropConjunctPosition({ 'subject+1': { x: 1, y: 1 } }, 'subject', 0, 2)).toEqual({});
  });
});

describe('sameHostedRing', () => {
  const a = ring(80, { p: { x: 1, y: 2 } });

  it('reads sub-pixel jitter as the same ring', () => {
    expect(sameHostedRing(a, { ...a, rOut: 80.3, ports: { p: { x: 1.4, y: 2 } } })).toBe(true);
  });

  it('tells a grown ring, a moved port or a new port apart', () => {
    expect(sameHostedRing(undefined, a)).toBe(false);
    expect(sameHostedRing(a, { ...a, rOut: 90 })).toBe(false);
    expect(sameHostedRing(a, { ...a, ports: { p: { x: 5, y: 2 } } })).toBe(false);
    expect(sameHostedRing(a, { ...a, ports: { ...a.ports, q: { x: 0, y: 0 } } })).toBe(false);
  });
});

describe('mergeHostedRing', () => {
  it('adds a ring newly drawn, and replaces one that changed', () => {
    const rings = { 'subject+1': ring(80) };

    expect(mergeHostedRing(rings, 'subject+2', ring(70))).toEqual({ 'subject+1': ring(80), 'subject+2': ring(70) });
    expect(mergeHostedRing(rings, 'subject+1', ring(90))).toEqual({ 'subject+1': ring(90) });
    expect(rings).toEqual({ 'subject+1': ring(80) });
  });

  it('drops a ring reported gone', () => {
    expect(mergeHostedRing({ 'subject+1': ring(80), 'subject+2': ring(70) }, 'subject+1', null)).toEqual({
      'subject+2': ring(70),
    });
  });

  it('hands back the very same rings when the report changes nothing', () => {
    const rings = { 'subject+1': ring(80, { p: { x: 1, y: 2 } }) };

    expect(mergeHostedRing(rings, 'subject+1', ring(80.4, { p: { x: 1.2, y: 2 } }))).toBe(rings);
    expect(mergeHostedRing(rings, 'subject+2', null)).toBe(rings);
  });
});
