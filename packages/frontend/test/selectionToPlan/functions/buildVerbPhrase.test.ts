import { describe, expect, it } from 'vitest';
import { buildVerbPhrase } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/buildVerbPhrase.ts';
import { ALWAYS, CAT, CAN, GO, NEVER, QUICKLY, WANT } from '../fixtures.ts';

describe('buildVerbPhrase', () => {
  it('is undefined for a verbless period, whatever else it holds', () => {
    expect(buildVerbPhrase({ subject: CAT, verbModal: WANT, modifier: QUICKLY })).toBeUndefined();
  });

  it('carries the verb with its polarity, tense, aspect and adverb, and no modals', () => {
    const vp = buildVerbPhrase({
      verb: GO,
      verbNegative: true,
      verbTense: 'past',
      verbAspect: 'progressive',
      modifier: QUICKLY,
    });

    expect(vp).toEqual({ verb: 'GO', negative: true, tense: 'past', aspect: 'progressive', modifier: 'QUICKLY' });
    expect(vp).not.toHaveProperty('modals');
  });

  it('carries the further adverbs of the chain as `modifiers` (P15)', () => {
    expect(buildVerbPhrase({ verb: GO, modifier: ALWAYS, modifier2: QUICKLY, modifier3: NEVER }))
      .toMatchObject({ modifier: 'ALWAYS', modifiers: ['QUICKLY', 'NEVER'] });
    expect(buildVerbPhrase({ verb: GO, modifier: ALWAYS })).not.toHaveProperty('modifiers');
  });

  it('chains the modals outermost first, each with its own adverb', () => {
    expect(
      buildVerbPhrase({
        verb: GO,
        modifier: ALWAYS,
        verbModal: WANT,
        verbModalAdverb: NEVER,
        verbModal2: CAN,
      })?.modals,
    ).toEqual([{ verb: 'WANT', modifier: 'NEVER' }, { verb: 'CAN' }]);
  });

  // Polarity is per word of the verb group: the verb's own control denies the verb, and each
  // modal's denies that modal — "I do not want to not go" is both of them set (A03).
  it('gives each modal its own negation, and leaves the verb’s on the verb phrase', () => {
    const vp = buildVerbPhrase({
      verb: GO,
      verbNegative: true,
      verbModal: WANT,
      verbModalNegative: true,
      verbModal2: CAN,
    });

    expect(vp?.negative).toBe(true);
    expect(vp?.modals).toEqual([{ verb: 'WANT', negative: true }, { verb: 'CAN' }]);
  });

  it('writes no negation for a modal left positive', () => {
    const vp = buildVerbPhrase({ verb: GO, verbModal: WANT, verbModal2: CAN, verbModal2Negative: true });

    expect(vp?.modals).toEqual([{ verb: 'WANT' }, { verb: 'CAN', negative: true }]);
    expect(vp?.modals?.[0]).not.toHaveProperty('negative');
  });

  it('keeps a modal’s adverb and its negation together', () => {
    expect(
      buildVerbPhrase({ verb: GO, verbModal: WANT, verbModalAdverb: NEVER, verbModalNegative: true })?.modals,
    ).toEqual([{ verb: 'WANT', modifier: 'NEVER', negative: true }]);
  });

  it('keeps the second modal when the first is empty', () => {
    expect(buildVerbPhrase({ verb: GO, verbModal2: CAN, verbModal2Adverb: ALWAYS })?.modals).toEqual([
      { verb: 'CAN', modifier: 'ALWAYS' },
    ]);
  });

  it('drops an adverb whose modal is empty', () => {
    expect(buildVerbPhrase({ verb: GO, verbModalAdverb: NEVER })).not.toHaveProperty('modals');
  });
});
