import { describe, expect, it } from 'vitest';
import { hostedRect, type HostedRing } from '../../src/components/PhraseBuilder/conjunctChain.ts';
import type { OwnerSpot } from '../../src/components/PhraseBuilder/ownerChain.ts';
import type { GroupRect } from '../../src/components/PhraseBuilder/graph.ts';
import type { Pt } from '../../src/components/PhraseBuilder/ringLayout.ts';
import { hostedRectsFor } from '../../src/components/PhraseBuilder/functions/hostedRects.ts';

const ring = (rOut: number): HostedRing => ({ rIn: rOut - 30, orbit: rOut - 20, rOut, ports: {} });
const head = (mainKey: string, label: string, color: string) =>
  ({ mainKey, label, color, nodeKeys: [mainKey] }) as unknown as GroupRect;
const centerOf = (key: string): Pt => ({ x: key.length * 10, y: 50 });

const owner = (address: string, possessedKey: string, role: OwnerSpot['role'], order: number): OwnerSpot => ({
  address,
  possessed: possessedKey,
  possessedKey,
  role,
  order,
  named: true,
});

const SUBJECT = head('subject', 'Subject', '#1976d2');
const OBJECT = head('directObject', 'Direct Object', '#2e7d32');

const rects = (over: Partial<Parameters<typeof hostedRectsFor>[0]> = {}) =>
  hostedRectsFor({
    chains: [],
    owners: [],
    groupRects: [SUBJECT, OBJECT],
    hostedRings: {},
    centerOf,
    compact: false,
    ...over,
  });

describe('hostedRectsFor', () => {
  it('makes each reported conjunct ring a constituent in its head’s colour, in group order', () => {
    const { conjunctRects, standIns } = rects({
      chains: [{ which: 'subject', count: 2 }],
      hostedRings: { 'subject+1': ring(80), 'subject+2': ring(70) },
    });

    expect(conjunctRects).toEqual([
      hostedRect({ key: 'subject+1', color: SUBJECT.color, kind: 'conjunct', head: 'Subject', index: 0, center: centerOf('subject+1'), ring: ring(80), compact: false }),
      hostedRect({ key: 'subject+2', color: SUBJECT.color, kind: 'conjunct', head: 'Subject', index: 1, center: centerOf('subject+2'), ring: ring(70), compact: false }),
    ]);
    expect(standIns).toEqual({ Subject: conjunctRects });
  });

  it('leaves out a ring not reported yet, and a group whose head has no ring here', () => {
    const { conjunctRects, standIns } = rects({
      chains: [
        { which: 'subject', count: 2 },
        { which: 'predicative', count: 1 },
      ],
      hostedRings: { 'subject+2': ring(70), 'predicative+1': ring(70) },
    });

    expect(conjunctRects.map((r) => r.mainKey)).toEqual(['subject+2']);
    expect(conjunctRects[0].conjunct).toEqual({ head: 'Subject', index: 1 });
    expect(Object.keys(standIns)).toEqual(['Subject']);
  });

  it('makes each reported owner ring a constituent in its period noun’s colour, packed at its order', () => {
    const { ownerRects } = rects({
      owners: [
        owner('directObject/possessor', 'directObject', 'directObject', -0.5),
        owner('subject/possessor', 'subject', 'subject', -0.5),
        owner('cause/possessor', 'cause', 'cause', -0.5),
      ],
      hostedRings: { 'directObject/possessor': ring(60), 'cause/possessor': ring(60) },
      compact: true,
    });

    expect(ownerRects).toEqual([
      hostedRect({ key: 'directObject/possessor', color: OBJECT.color, kind: 'owner', head: 'Direct Object', index: -0.5, center: centerOf('directObject/possessor'), ring: ring(60), compact: true }),
    ]);
  });
});
