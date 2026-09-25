import { describe, expect, it, vi } from 'vitest';
import { chainPortKey, type HostedRing } from '../../src/components/PhraseBuilder/conjunctChain.ts';
import { ownerPortKey, type OwnerSpot } from '../../src/components/PhraseBuilder/ownerChain.ts';
import type { Pt } from '../../src/components/PhraseBuilder/ringLayout.ts';
import { ringHosts, type Hosting } from '../../src/components/PhraseBuilder/functions/ringHosts.ts';

const HOSTING: Hosting = {
  graphSize: { w: 600, h: 400 },
  compact: false,
  draggingKey: null,
  makeDragProps: vi.fn(),
  makeGroupDragProps: vi.fn(),
  nudge: vi.fn(),
  ownersOpen: {},
  setOwnerOpen: vi.fn(),
};
const wordPos = (key: string): Pt => ({ x: key.length, y: 10 });
const centerOf = (key: string): Pt => ({ x: key.length * 10, y: 100 });
const RING: HostedRing = { rIn: 30, orbit: 40, rOut: 60, ports: {} };

const hosts = (over: Partial<Parameters<typeof ringHosts>[0]> = {}) =>
  ringHosts({
    hosting: HOSTING,
    chains: [{ which: 'subject', count: 3 }],
    wordPos,
    centerOf,
    possessorToward: () => undefined,
    reportRing: vi.fn(),
    onAddConjunct: vi.fn(),
    ...over,
  });

describe('ringHosts', () => {
  describe('a conjunct', () => {
    it('is placed by the canvas, under its chain key, in its head’s role', () => {
      const host = hosts().conjunctHost('subject', 1);

      expect(host).toMatchObject({ ...HOSTING, kind: 'conjunct', key: 'subject+2', role: 'subject', at: wordPos('subject+2') });
    });

    it('faces its ports at the rings either side of it in its group', () => {
      const { conjunctHost } = hosts();

      expect(conjunctHost('subject', 1).ports).toEqual([
        { key: chainPortKey('subject+2', 'subject+1'), toward: centerOf('subject+1') },
        { key: chainPortKey('subject+2', 'subject+3'), toward: centerOf('subject+3') },
      ]);
      expect(conjunctHost('subject', 0).ports.map((p) => p.key)).toEqual([
        chainPortKey('subject+1', 'subject'),
        chainPortKey('subject+1', 'subject+2'),
      ]);
      expect(conjunctHost('subject', 2).ports.map((p) => p.key)).toEqual([chainPortKey('subject+3', 'subject+2')]);
    });

    it('carries the group-extending control only on the last ring, adding to the head’s group', () => {
      const onAddConjunct = vi.fn();
      const { conjunctHost } = hosts({ onAddConjunct });

      expect([0, 1, 2].map((i) => conjunctHost('subject', i).isLast)).toEqual([false, false, true]);
      conjunctHost('subject', 0).onAddConjunct!();
      expect(onAddConjunct).toHaveBeenCalledExactlyOnceWith('subject');
    });

    it('reports its ring under its own key, and aims its possessor control as the canvas says', () => {
      const reportRing = vi.fn();
      const host = hosts({ reportRing, possessorToward: (key) => (key === 'subject+1' ? { x: 1, y: 2 } : undefined) }).conjunctHost(
        'subject',
        0,
      );

      host.onRing(RING);
      host.onRing(null);

      expect(reportRing.mock.calls).toEqual([
        ['subject+1', RING],
        ['subject+1', null],
      ]);
      expect(host.possessorToward).toEqual({ x: 1, y: 2 });
    });
  });

  // P09-E12 D5: the standard is hosted as an owner is, faded while its degree takes none.
  describe('a standard of comparison', () => {
    it('is an owner’s hand-off of its own kind, dimmed as its spot says', () => {
      const spot = { address: 'predicative/standard', possessed: 'predicative', possessedKey: 'predicative', role: 'predicative' as const, order: -0.5, named: true, dimmed: true, set: false };
      const host = hosts().standardHost(spot);

      expect(host).toMatchObject({
        kind: 'standard',
        key: 'predicative/standard',
        role: 'predicative',
        dimmed: true,
        set: false,
        ports: [{ key: ownerPortKey(spot), toward: centerOf('predicative') }],
      });
    });

    // P09-E51 D2: on a superlative the ring is the set, which titles it.
    it('carries whether it is a superlative’s set', () => {
      const spot = { address: 'predicative/standard', possessed: 'predicative', possessedKey: 'predicative', role: 'predicative' as const, order: -0.5, named: true, dimmed: false, set: true };
      expect(hosts().standardHost(spot)).toMatchObject({ kind: 'standard', dimmed: false, set: true });
    });
  });

  describe('an owner', () => {
    const SPOT: OwnerSpot = {
      address: 'directObject/possessor',
      possessed: 'directObject',
      possessedKey: 'directObject',
      role: 'directObject',
      order: -0.5,
      named: false,
    };

    it('is placed under its address, facing its one port at the ring it owns', () => {
      const reportRing = vi.fn();
      const host = hosts({ reportRing }).ownerHost(SPOT);

      expect(host).toMatchObject({
        ...HOSTING,
        kind: 'owner',
        key: 'directObject/possessor',
        role: 'directObject',
        at: wordPos('directObject/possessor'),
        ports: [{ key: ownerPortKey(SPOT), toward: centerOf('directObject') }],
      });
      expect(host.isLast).toBeUndefined();
      host.onRing(RING);
      expect(reportRing).toHaveBeenCalledExactlyOnceWith('directObject/possessor', RING);
    });
  });
});
