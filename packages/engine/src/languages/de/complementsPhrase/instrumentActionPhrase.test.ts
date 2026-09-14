import { describe, expect, test } from 'vitest';
import type { AbstractionLevel, Specifier } from '@signi/shared';
import { BUCH, complement, concept, el, MESSER, np, SCHNELL, vp, WAEHLEN, WORT } from '../de.fixtures.js';
import { instrumentActionPhrase } from './instrumentActionPhrase.js';

const abstraction = (value: AbstractionLevel): Specifier => ({ kind: 'abstraction', value });

describe('instrumentActionPhrase', () => {
  // The plain "mit" + dative noun is the shared prepositional path's.
  test('leaves the object level, or an instrument without an action, to the prepositional path', () => {
    expect(instrumentActionPhrase(complement(np(MESSER)))).toBeUndefined();
    expect(instrumentActionPhrase(complement(np(MESSER), [abstraction('object')], vp(WAEHLEN)))).toBeUndefined();
    expect(instrumentActionPhrase(complement(np(WORT), [abstraction('process')]))).toBeUndefined();
  });

  // The impersonal "man" is a documented simplification (B06). The leading comma is pulled back
  // onto the previous word when the sentence is joined.
  test('a process instrument is a comma-led "indem man" clause with an accusative object', () => {
    const word = np(WORT, { definiteness: 'indefinite' });
    expect(instrumentActionPhrase(complement(word, [abstraction('process')], vp(WAEHLEN)))).toBe(', indem man ein Wort wählt');
    expect(instrumentActionPhrase(complement(word, [abstraction('process')], vp(WAEHLEN, { modifier: concept(SCHNELL) }))))
      .toBe(', indem man ein Wort schnell wählt');
    expect(instrumentActionPhrase(complement(el(word, np(BUCH, { definiteness: 'indefinite' })), [abstraction('process')], vp(WAEHLEN))))
      .toBe(', indem man ein Wort und ein Buch wählt');
  });

  test('a process verb with no stored 3sg present falls back to its infinitive, then to nothing', () => {
    const word = np(WORT, { definiteness: 'indefinite' });
    expect(instrumentActionPhrase(complement(word, [abstraction('process')], vp({ base: 'wählen' })))).toBe(', indem man ein Wort wählen');
    expect(instrumentActionPhrase(complement(word, [abstraction('process')], vp({})))).toBe(', indem man ein Wort');
  });

  // German nominalises the infinitive ("das Wählen"); its object becomes a genitive and its
  // adverb an attributive adjective.
  test('a concept instrument nominalises the infinitive with a genitive object', () => {
    expect(instrumentActionPhrase(complement(np(WORT, { definiteness: 'indefinite' }), [abstraction('concept')], vp(WAEHLEN))))
      .toBe('mit dem Wählen eines Wortes');
    expect(instrumentActionPhrase(complement(np(WORT), [abstraction('concept')], vp(WAEHLEN, { modifier: concept(SCHNELL) }))))
      .toBe('mit dem schnellen Wählen des Wortes');
  });
});
