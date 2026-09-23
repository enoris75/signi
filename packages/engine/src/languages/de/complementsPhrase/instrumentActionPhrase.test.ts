import { describe, expect, test } from 'vitest';
import type { AbstractionLevel, Specifier } from '@signi/shared';
import { BUCH, complement, concept, DU, el, HINZUFUEGEN, ICH, KATER, KATZE, MAN, MESSER, np, SCHNELL, vp, WAEHLEN, WORT } from '../de.fixtures.js';
import { instrumentActionPhrase } from './instrumentActionPhrase.js';

const abstraction = (value: AbstractionLevel): Specifier => ({ kind: 'abstraction', value });

describe('instrumentActionPhrase', () => {
  // The plain "mit" + dative noun is the shared prepositional path's.
  test('leaves the object level, or an instrument without an action, to the prepositional path', () => {
    expect(instrumentActionPhrase(complement(np(MESSER)))).toBeUndefined();
    expect(instrumentActionPhrase(complement(np(MESSER), [abstraction('object')], vp(WAEHLEN)))).toBeUndefined();
    expect(instrumentActionPhrase(complement(np(WORT), [abstraction('process')]))).toBeUndefined();
  });

  // With no doer the act is nobody's in particular, and German says "man". The leading comma is
  // pulled back onto the previous word when the sentence is joined.
  test('a process instrument is a comma-led "indem man" clause with an accusative object', () => {
    const word = np(WORT, { definiteness: 'indefinite' });
    expect(instrumentActionPhrase(complement(word, [abstraction('process')], vp(WAEHLEN)))).toBe(', indem man ein Wort wählt');
    expect(instrumentActionPhrase(complement(word, [abstraction('process')], vp(WAEHLEN, { modifier: concept(SCHNELL) }))))
      .toBe(', indem man ein Wort schnell wählt');
    expect(instrumentActionPhrase(complement(el(word, np(BUCH, { definiteness: 'indefinite' })), [abstraction('process')], vp(WAEHLEN))))
      .toBe(', indem man ein Wort und ein Buch wählt');
  });

  // B06: the clause names whoever wields the instrument, and its verb agrees with that pronoun.
  test("a doer's personal pronoun is the subject, and the verb agrees with it", () => {
    const aWord = complement(np(WORT, { definiteness: 'indefinite' }), [abstraction('process')], vp(WAEHLEN));
    expect(instrumentActionPhrase(aWord, KATER)).toBe(', indem er ein Wort wählt');
    expect(instrumentActionPhrase(aWord, KATZE)).toBe(', indem sie ein Wort wählt');
    expect(instrumentActionPhrase(aWord, ICH)).toBe(', indem ich ein Wort wähle');
    expect(instrumentActionPhrase(aWord, { ...ICH, number: 'plural' })).toBe(', indem wir ein Wort wählen');
    expect(instrumentActionPhrase(aWord, DU)).toBe(', indem du ein Wort wählst');
    expect(instrumentActionPhrase(aWord, MAN)).toBe(', indem man ein Wort wählt');
    expect(instrumentActionPhrase(complement(np(WORT, { definiteness: 'indefinite' }), [abstraction('process')], vp(HINZUFUEGEN)), { ...KATER, number: 'plural' }))
      .toBe(', indem sie ein Wort hinzufügen');
    // The concept level has no subject to agree.
    expect(instrumentActionPhrase(complement(np(WORT), [abstraction('concept')], vp(WAEHLEN)), ICH)).toBe('mit dem Wählen des Wortes');
  });

  test('a process verb with no stored present for its person falls back to its infinitive, then to nothing', () => {
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

  // A138: the means clause is verb-final, so a separable verb's particle rejoins it.
  test('a separable verb closes the means clause whole, and nominalises whole', () => {
    expect(instrumentActionPhrase(complement(np(WORT, { definiteness: 'indefinite' }), [abstraction('process')], vp(HINZUFUEGEN))))
      .toBe(', indem man ein Wort hinzufügt');
    expect(instrumentActionPhrase(complement(np(WORT, { definiteness: 'indefinite' }), [abstraction('concept')], vp(HINZUFUEGEN))))
      .toBe('mit dem Hinzufügen eines Wortes');
  });

  // P09-E2: the act denied. The process level is the subjectless "ohne … zu" clause, whoever the doer
  // is; the concept level keeps its noun under an accusative "ohne", its adjective weak after "das".
  test('a denied act is the "ohne … zu" clause, or "ohne das" + the nominalised infinitive', () => {
    const denied = (level: AbstractionLevel, action = vp(WAEHLEN)) =>
      ({ ...complement(np(WORT, { definiteness: 'indefinite' }), [abstraction(level)], action), negative: true });
    expect(instrumentActionPhrase(denied('process'), KATER)).toBe(', ohne ein Wort zu wählen');
    expect(instrumentActionPhrase(denied('process', vp(HINZUFUEGEN)))).toBe(', ohne ein Wort hinzuzufügen');
    expect(instrumentActionPhrase(denied('concept'))).toBe('ohne das Wählen eines Wortes');
    expect(instrumentActionPhrase(denied('concept', vp(WAEHLEN, { modifier: concept(SCHNELL) }))))
      .toBe('ohne das schnelle Wählen eines Wortes');
  });
});
