import { describe, expect, test } from 'vitest';
import { complement, complements, el, group, np, vp } from '../languages/resolved.fixtures.js';
import { negationSources } from './negationSources.js';

const EAT = { base: 'eat' };
const MOUSE = { base: 'mouse' };
const HOUSE = { base: 'house' };
const NEVER = { base: 'never', subtype: 'frequency', polarity: 'negative' };
const ALWAYS = { base: 'always', subtype: 'frequency' };
const none = { subject: false, adverb: false, verb: false, object: false, complement: false };

describe('negationSources', () => {
  test('an affirmative clause carries none of them', () => {
    expect(negationSources({ verbPhrase: vp(EAT), directObject: el(np(MOUSE)) })).toEqual(none);
    expect(negationSources({
      verbPhrase: vp(EAT, { modifier: { conceptId: 'ALWAYS', forms: ALWAYS } }),
      complements: complements({ locative: complement(np(HOUSE)) }),
    })).toEqual(none);
  });

  test('each source is counted on its own', () => {
    expect(negationSources({ subjectIsNegative: true, verbPhrase: vp(EAT) })).toEqual({ ...none, subject: true });
    expect(negationSources({ verbPhrase: vp(EAT, { negative: true }) })).toEqual({ ...none, verb: true });
    expect(negationSources({ verbPhrase: vp(EAT, { modifier: { conceptId: 'NEVER', forms: NEVER } }) }))
      .toEqual({ ...none, adverb: true });
    expect(negationSources({ verbPhrase: vp(EAT), directObject: el(np(MOUSE, { definiteness: 'no' })) }))
      .toEqual({ ...none, object: true });
    expect(negationSources({
      verbPhrase: vp(EAT), complements: complements({ locative: complement(np(HOUSE, { definiteness: 'no' })) }),
    })).toEqual({ ...none, complement: true });
  });

  test('one `no` conjunct is enough, on either the object or a complement', () => {
    const mixed = group('or', np(MOUSE), np(MOUSE, { definiteness: 'no' }));
    expect(negationSources({ verbPhrase: vp(EAT), directObject: mixed }).object).toBe(true);
    expect(negationSources({
      verbPhrase: vp(EAT), complements: complements({ locative: complement(group('or', np(HOUSE), np(HOUSE, { definiteness: 'no' }))) }),
    }).complement).toBe(true);
  });

  // The whole point of counting them: a clause can carry several at once, and the engine that has no
  // negative concord then has to pick which one surfaces (A158, A160).
  test('all five at once', () => {
    expect(negationSources({
      subjectIsNegative: true,
      verbPhrase: vp(EAT, { negative: true, modifier: { conceptId: 'NEVER', forms: NEVER } }),
      directObject: el(np(MOUSE, { definiteness: 'no' })),
      complements: complements({ locative: complement(np(HOUSE, { definiteness: 'no' })) }),
    })).toEqual({ subject: true, adverb: true, verb: true, object: true, complement: true });
  });

  // `subjectIsNegative` is the caller's: a relative clause leaves it unset, because its head's
  // `no` negates the matrix clause and not the relative one.
  test('the subject is not read off the clause', () => {
    expect(negationSources({ verbPhrase: vp(EAT) }).subject).toBe(false);
    expect(negationSources({ subjectIsNegative: false, verbPhrase: vp(EAT) }).subject).toBe(false);
  });
});
