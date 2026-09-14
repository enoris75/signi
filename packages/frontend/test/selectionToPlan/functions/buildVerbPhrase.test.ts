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

  it('keeps the second modal when the first is empty', () => {
    expect(buildVerbPhrase({ verb: GO, verbModal2: CAN, verbModal2Adverb: ALWAYS })?.modals).toEqual([
      { verb: 'CAN', modifier: 'ALWAYS' },
    ]);
  });

  it('drops an adverb whose modal is empty', () => {
    expect(buildVerbPhrase({ verb: GO, verbModalAdverb: NEVER })).not.toHaveProperty('modals');
  });
});
