import { describe, expect, test } from 'vitest';
import { adj, BESTIMMUNG_RICHTUNG, BOOT, BUCH, ESSEN, EUROPA, GROSS, HAUS, JUNGE, KATER, KATZE, KLEIN, np, nounModifier, SEGEL, vp, WORT } from './de.fixtures.js';
import { nounPhrase } from './nounPhrase.js';

describe('nounPhrase', () => {
  test('article + declined adjective + noun, in each case', () => {
    const phrase = np(KATER, {}, { adjectives: [adj(KLEIN)] });
    expect(nounPhrase(phrase, 'nom')).toBe('der kleine Kater');
    expect(nounPhrase(phrase, 'acc')).toBe('den kleinen Kater');
    expect(nounPhrase(phrase, 'dat')).toBe('dem kleinen Kater');
  });

  // A169: a bare-name place takes the article once an adjective modifies it.
  test('a bare-name place takes the article with an adjective, and stays bare without one', () => {
    const bigEurope = np(EUROPA, {}, { adjectives: [adj(GROSS)] });
    expect(nounPhrase(bigEurope, 'nom')).toBe('das große Europa');
    expect(nounPhrase(bigEurope, 'dat')).toBe('dem großen Europa');
    expect(nounPhrase(np(EUROPA), 'nom')).toBe('Europa');
  });

  test('an indefinite phrase takes ein- and the mixed adjective ending', () => {
    expect(nounPhrase(np(BUCH, { definiteness: 'indefinite' }, { adjectives: [adj(GROSS)] }), 'nom')).toBe('ein großes Buch');
  });

  test('the plural surface, with the dative-plural -n', () => {
    expect(nounPhrase(np(HAUS, { number: 'plural' }), 'nom')).toBe('die Häuser');
    expect(nounPhrase(np(HAUS, { number: 'plural' }), 'dat')).toBe('den Häusern');
  });

  test('a masculine/neuter singular takes the genitive -(e)s', () => {
    expect(nounPhrase(np(WORT, { definiteness: 'indefinite' }), 'gen')).toBe('eines Wortes');
    expect(nounPhrase(np(KATZE), 'gen')).toBe('der Katze');
  });

  test('a weak masculine declines to -n outside the nominative singular', () => {
    expect(nounPhrase(np(JUNGE), 'nom')).toBe('der Junge');
    expect(nounPhrase(np(JUNGE), 'acc')).toBe('den Jungen');
    expect(nounPhrase(np(JUNGE), 'gen')).toBe('des Jungen');
  });

  // A140: the adjective declines like any attributive adjective; the genitive after the head stays fixed,
  // and the dative-plural -n goes on the head.
  test('a multiword name declines its adjective and head, not the words after the head', () => {
    expect(nounPhrase(np(BESTIMMUNG_RICHTUNG), 'nom')).toBe('die adverbiale Bestimmung der Richtung');
    expect(nounPhrase(np(BESTIMMUNG_RICHTUNG, { number: 'plural' }), 'nom')).toBe('die adverbialen Bestimmungen der Richtung');
    expect(nounPhrase(np(BESTIMMUNG_RICHTUNG, { number: 'plural' }), 'dat')).toBe('den adverbialen Bestimmungen der Richtung');
    expect(nounPhrase(np(BESTIMMUNG_RICHTUNG, { definiteness: 'indefinite' }, { adjectives: [adj(GROSS)] }), 'dat'))
      .toBe('einer großen adverbialen Bestimmung der Richtung');
  });

  test('an attributive noun closes into a compound on the head', () => {
    const phrase = np(BOOT, {}, { nounModifiers: [nounModifier(SEGEL)] });
    expect(nounPhrase(phrase, 'nom')).toBe('das Segelboot');
  });

  test('a pronominal possessor replaces the article and the adjective declines mixed', () => {
    const phrase = np(KATER, {}, {
      adjectives: [adj(KLEIN)],
      possessor: { kind: 'pronominal', person: '1', number: 'singular' },
    });
    expect(nounPhrase(phrase, 'nom')).toBe('mein kleiner Kater');
    expect(nounPhrase(phrase, 'acc')).toBe('meinen kleinen Kater');
  });

  // A174: a possessive declines as "kein" does, so the plural takes the weak -en, not the strong
  // endings of an article-less plural.
  test('after a plural possessive the adjective takes the weak -en in every case', () => {
    const phrase = np(KATER, { number: 'plural' }, {
      adjectives: [adj(GROSS)],
      possessor: { kind: 'pronominal', person: '1', number: 'singular' },
    });
    expect(nounPhrase(phrase, 'nom')).toBe('meine großen Kater');
    expect(nounPhrase(phrase, 'acc')).toBe('meine großen Kater');
    expect(nounPhrase(phrase, 'dat')).toBe('meinen großen Katern');
    expect(nounPhrase(phrase, 'gen')).toBe('meiner großen Kater');
  });

  // B09: a noun possessor trails in the genitive, whatever the head's own case.
  test('a noun possessor trails in the genitive', () => {
    expect(nounPhrase(np(BUCH, {}, { possessor: np(JUNGE) }), 'nom')).toBe('das Buch des Jungen');
    expect(nounPhrase(np(BUCH, {}, { possessor: np(KATER) }), 'dat')).toBe('dem Buch des Katers');
  });

  test('a relative clause trails the noun, bracketed by commas', () => {
    const relative = { headRole: 'subject' as const, verbPhrase: vp(ESSEN) };
    expect(nounPhrase(np(KATER, {}, { relative }), 'nom')).toBe('der Kater, der isst,');
  });
});
