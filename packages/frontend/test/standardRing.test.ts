// P09-E12 D5: the predicate adjective's standard of comparison on the period's canvas.
import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import type { PhraseSelection } from '../src/components/PhraseBuilder/interfaces.ts';
import { ownerPortKey, type RingAt } from '../src/components/PhraseBuilder/ownerChain.ts';
import { perimeterControlKey } from '../src/components/PhraseBuilder/ringSpecs.ts';
import { STANDARD_ADDRESS, standardIsSet, standardLink, standardSpotFor, takesStandard } from '../src/components/PhraseBuilder/standardRing.ts';

const BIG: Concept = { id: 'BIG', role: 'adjective', description: 'BIG', label: 'big' };
const CAT: Concept = { id: 'CAT', role: 'noun', description: 'CAT', label: 'cat' };
const DOG: Concept = { id: 'DOG', role: 'noun', description: 'DOG', label: 'dog' };
const GROUPS = [{ mainKey: 'subject' }, { mainKey: 'verb' }, { mainKey: 'predicative' }];
const BIGGER: PhraseSelection = { predicative: BIG, adjectiveDegrees: { predicative: 'more' }, predicativeStandard: { subject: DOG } };

describe('takesStandard', () => {
  it.each([
    ['more', true],
    ['less', true],
    ['equally', true],
    ['positive', false],
    // P09-E51 D1: a superlative takes the same field as its set.
    ['most', true],
    ['least', true],
  ] as const)('takes a standard under %s: %s', (degree, takes) => {
    expect(takesStandard({ predicative: BIG, adjectiveDegrees: { predicative: degree } })).toBe(takes);
    expect(standardIsSet({ predicative: BIG, adjectiveDegrees: { predicative: degree } })).toBe(degree === 'most' || degree === 'least');
  });

  it('takes none on a predicate noun', () => {
    expect(takesStandard({ predicative: CAT, adjectiveDegrees: { predicative: 'more' } })).toBe(false);
  });
});

describe('standardSpotFor', () => {
  it('draws a named standard beside its predicative, after the predicative’s conjuncts', () => {
    expect(standardSpotFor({ selection: BIGGER, groups: GROUPS, open: undefined })).toEqual({
      address: STANDARD_ADDRESS,
      possessed: 'predicative',
      possessedKey: 'predicative',
      role: 'predicative',
      order: -0.5,
      named: true,
      dimmed: false,
      set: false,
    });
    expect(
      standardSpotFor({ selection: { ...BIGGER, predicativeConjuncts: [{ subject: BIG }] }, groups: GROUPS, open: undefined })?.order,
    ).toBe(0.5);
  });

  it('dims a standard its degree takes none of, and keeps drawing it', () => {
    expect(
      standardSpotFor({ selection: { ...BIGGER, adjectiveDegrees: { predicative: 'positive' } }, groups: GROUPS, open: undefined }),
    ).toMatchObject({ dimmed: true, set: false });
  });

  // P09-E51: on a superlative the ring is the set it picks from, drawn undimmed.
  it('draws a superlative’s standard undimmed, as its set', () => {
    expect(
      standardSpotFor({ selection: { ...BIGGER, adjectiveDegrees: { predicative: 'most' } }, groups: GROUPS, open: undefined }),
    ).toMatchObject({ dimmed: false, set: true });
    expect(
      standardSpotFor({ selection: { ...BIGGER, adjectiveDegrees: { predicative: 'least' } }, groups: GROUPS, open: undefined }),
    ).toMatchObject({ dimmed: false, set: true });
  });

  it('draws an empty standard only while it is open, and a folded one not at all', () => {
    const empty: PhraseSelection = { predicative: BIG, adjectiveDegrees: { predicative: 'less' } };
    expect(standardSpotFor({ selection: empty, groups: GROUPS, open: undefined })).toBeUndefined();
    expect(standardSpotFor({ selection: empty, groups: GROUPS, open: true })).toMatchObject({ named: false });
    expect(standardSpotFor({ selection: BIGGER, groups: GROUPS, open: false })).toBeUndefined();
  });

  it('draws nothing without a predicate adjective on the canvas', () => {
    expect(standardSpotFor({ selection: BIGGER, groups: [{ mainKey: 'subject' }], open: true })).toBeUndefined();
    expect(standardSpotFor({ selection: { predicative: CAT }, groups: GROUPS, open: true })).toBeUndefined();
  });
});

describe('standardLink', () => {
  const spot = standardSpotFor({ selection: BIGGER, groups: GROUPS, open: undefined })!;
  const rings: Record<string, RingAt> = {
    predicative: { center: { x: 100, y: 100 }, rIn: 20, rOut: 60 },
    [STANDARD_ADDRESS]: { center: { x: 300, y: 100 }, rIn: 20, rOut: 60 },
  };

  it('runs from the standard control to the port the standard’s ring faces it with', () => {
    const at: Record<string, { x: number; y: number }> = {
      [`predicative|${perimeterControlKey('standard', 'predicative')}`]: { x: 150, y: 110 },
      [`${STANDARD_ADDRESS}|${ownerPortKey(spot)}`]: { x: 250, y: 100 },
    };
    const link = standardLink({ spot, ringOf: (k) => rings[k], controlOn: (k, c) => at[`${k}|${c}`], compact: false });
    expect(link).toMatchObject({ from: { x: 150, y: 110 }, to: { x: 250, y: 100 }, mid: { x: 200, y: 105 } });
  });

  it('leaves from the ring’s edge while the control is withdrawn, and waits for both rings', () => {
    const link = standardLink({ spot, ringOf: (k) => rings[k], controlOn: () => undefined, compact: false });
    expect(link?.from).toEqual({ x: 160, y: 100 });
    expect(
      standardLink({ spot, ringOf: (k) => (k === 'predicative' ? rings[k] : undefined), controlOn: () => undefined, compact: false }),
    ).toBeNull();
  });
});
