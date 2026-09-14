import { describe, expect, it } from 'vitest';
import { COMPACT_PAD_H, COMPACT_PAD_V } from '../../src/components/PhraseBuilder/layout.ts';
import { BUTTON_HALF, innerRadius } from '../../src/components/PhraseBuilder/ringLayout.ts';
import { compactPacking } from '../../src/components/PhraseBuilder/functions/compactPacking.ts';

const slots = (...keys: string[]) => keys.map((key) => ({ key }));
const small = () => ({ w: 10, h: 10 });

const pack = (over: Partial<Parameters<typeof compactPacking>[0]> = {}) =>
  compactPacking({
    renderedSlots: slots('subject', 'verb', 'directObject'),
    chains: [],
    owners: [],
    groups: [],
    sizeOf: small,
    hostedRings: {},
    ...over,
  });

describe('compactPacking', () => {
  it('packs the rendered words in reading order', () => {
    expect(pack().keys).toEqual(['subject', 'verb', 'directObject']);
  });

  it('packs a coordinated noun’s conjuncts straight after it, and each ring’s owners after that ring', () => {
    const { keys } = pack({
      chains: [{ which: 'subject', count: 2 }],
      owners: [
        { address: 'subject/possessor', possessedKey: 'subject' },
        { address: 'subject/possessor/possessor', possessedKey: 'subject/possessor' },
        { address: 'subject/conjunct/1/possessor', possessedKey: 'subject+2' },
      ],
    });

    expect(keys).toEqual([
      'subject',
      'subject/possessor',
      'subject/possessor/possessor',
      'subject+1',
      'subject+2',
      'subject/conjunct/1/possessor',
      'verb',
      'directObject',
    ]);
  });

  it('keeps the smallest cell while every ring fits in it', () => {
    expect(pack().cell).toEqual({ halfW: COMPACT_PAD_H, halfH: COMPACT_PAD_V });
    // Even a one-letter word's ring, at its smallest, is taller than the smallest cell.
    const half = Math.ceil(innerRadius(small()) + BUTTON_HALF);
    expect(pack({ groups: [{ mainKey: 'subject' }] }).cell).toEqual({ halfW: COMPACT_PAD_H, halfH: half });
  });

  it('grows the cell to the biggest solid ring, the canvas’s own or a hosted one packed here', () => {
    const wide = { w: 160, h: 20 };
    const own = pack({ groups: [{ mainKey: 'verb' }], sizeOf: (key) => (key === 'verb' ? wide : small()) });
    const ownHalf = Math.ceil(innerRadius(wide) + BUTTON_HALF);
    expect(own.cell).toEqual({ halfW: Math.max(COMPACT_PAD_H, ownHalf), halfH: Math.max(COMPACT_PAD_V, ownHalf) });

    const hosted = pack({ chains: [{ which: 'subject', count: 1 }], hostedRings: { 'subject+1': { rIn: 90 } } });
    expect(hosted.cell).toEqual({ halfW: 90 + BUTTON_HALF, halfH: 90 + BUTTON_HALF });
    // A hosted ring that is not packed here doesn't count.
    expect(pack({ hostedRings: { 'subject+1': { rIn: 90 } } }).cell.halfH).toBe(COMPACT_PAD_V);
  });
});
