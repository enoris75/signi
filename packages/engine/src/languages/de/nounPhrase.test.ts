import { describe, expect, test } from 'vitest';
import { adj, BESTIMMUNG_RICHTUNG, BOOT, BUCH, ESSEN, EUROPA, GROSS, HAUS, JUNGE, KATER, KATZE, KLEIN, np, nounModifier, SEGEL, VERWANDT, vp, WORT } from './de.fixtures.js';
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

  // A187: a head that carries a determiner of its own keeps it, and the possessor moves into a
  // postnominal "von" + dative phrase; the adjectives then decline after that determiner.
  test('a head with its own determiner keeps it and the possessor goes into a "von" phrase', () => {
    const her = { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } as const;
    expect(nounPhrase(np(KATER, { definiteness: 'this' }, { possessor: her }), 'nom')).toBe('dieser Kater von ihr');
    expect(nounPhrase(np(KATER, { definiteness: 'no' }, { possessor: her }), 'acc')).toBe('keinen Kater von ihr');
    expect(nounPhrase(np(KATER, { number: 'plural', definiteness: 'some' }, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }), 'nom'))
      .toBe('einige Kater von mir');
    const big = np(KATER, { definiteness: 'this' }, { adjectives: [adj(GROSS)], possessor: her });
    expect(nounPhrase(big, 'nom')).toBe('dieser große Kater von ihr'); // weak, after "dieser"
  });

  test('after "alle" the possessive stays in front of the noun', () => {
    const my = { kind: 'pronominal', person: '1', number: 'singular' } as const;
    expect(nounPhrase(np(KATER, { number: 'plural', definiteness: 'all' }, { possessor: my }), 'nom')).toBe('alle meine Kater');
    expect(nounPhrase(np(KATER, { number: 'plural', definiteness: 'all' }, { adjectives: [adj(GROSS)], possessor: my }), 'dat'))
      .toBe('allen meinen großen Katern');
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
  // ── P11 D8: the adjectival noun ───────────────────────────────────────────
  // *der Verwandte*, *ein Verwandter*: the noun declines like an adjective, by the very table its
  // own adjectives decline by, and takes none of the noun endings.

  describe('an adjectival noun', () => {
    test('takes the adjective ending its determiner and case select', () => {
      expect(nounPhrase(np(VERWANDT), 'nom')).toBe('der Verwandte');
      expect(nounPhrase(np(VERWANDT), 'acc')).toBe('den Verwandten');
      expect(nounPhrase(np(VERWANDT), 'dat')).toBe('dem Verwandten');
      expect(nounPhrase(np(VERWANDT, { definiteness: 'indefinite' }), 'nom')).toBe('ein Verwandter');
      expect(nounPhrase(np(VERWANDT, { definiteness: 'indefinite' }), 'acc')).toBe('einen Verwandten');
      expect(nounPhrase(np(VERWANDT, { definiteness: 'indefinite' }), 'dat')).toBe('einem Verwandten');
    });

    test('declines strong where no determiner carries the case', () => {
      expect(nounPhrase(np(VERWANDT, { definiteness: 'bare' }), 'nom')).toBe('Verwandter');
      expect(nounPhrase(np(VERWANDT, { definiteness: 'bare' }), 'dat')).toBe('Verwandtem');
      expect(nounPhrase(np(VERWANDT, { number: 'plural', definiteness: 'bare' }), 'nom')).toBe('Verwandte');
    });

    test('the plural takes the plural ending, and no dative-plural -n on top of it', () => {
      expect(nounPhrase(np(VERWANDT, { number: 'plural' }), 'nom')).toBe('die Verwandten');
      expect(nounPhrase(np(VERWANDT, { number: 'plural' }), 'dat')).toBe('den Verwandten');
    });

    test('the genitive is the adjective ending, not the noun -(e)s', () => {
      expect(nounPhrase(np(VERWANDT), 'gen')).toBe('des Verwandten');
      expect(nounPhrase(np(VERWANDT, { definiteness: 'indefinite' }), 'gen')).toBe('eines Verwandten');
    });

    test('the feminine declines as a feminine does', () => {
      const she = { gender: 'fem', base: 'Verwandt' };
      expect(nounPhrase(np(VERWANDT, she), 'nom')).toBe('die Verwandte');
      expect(nounPhrase(np(VERWANDT, { ...she, definiteness: 'indefinite' }), 'nom')).toBe('eine Verwandte');
      expect(nounPhrase(np(VERWANDT, { ...she, definiteness: 'indefinite' }), 'acc')).toBe('eine Verwandte');
      expect(nounPhrase(np(VERWANDT, { ...she, definiteness: 'indefinite' }), 'dat')).toBe('einer Verwandten');
    });

    test('a possessive is an ein-word, and the noun follows it as it follows "kein"', () => {
      const my = { kind: 'pronominal', person: '1', number: 'singular' } as const;
      expect(nounPhrase(np(VERWANDT, {}, { possessor: my }), 'nom')).toBe('mein Verwandter');
      expect(nounPhrase(np(VERWANDT, {}, { possessor: my }), 'dat')).toBe('meinem Verwandten');
      expect(nounPhrase(np(VERWANDT, { number: 'plural' }, { possessor: my }), 'nom')).toBe('meine Verwandten');
    });

    test('its own adjectives decline by the same table, agreeing all the way through', () => {
      expect(nounPhrase(np(VERWANDT, {}, { adjectives: [adj(KLEIN)] }), 'nom')).toBe('der kleine Verwandte');
      expect(nounPhrase(np(VERWANDT, { definiteness: 'indefinite' }, { adjectives: [adj(KLEIN)] }), 'nom')).toBe('ein kleiner Verwandter');
      expect(nounPhrase(np(VERWANDT, { number: 'plural', definiteness: 'bare' }, { adjectives: [adj(KLEIN)] }), 'dat')).toBe('kleinen Verwandten');
    });

    test('as a noun possessor it trails in the genitive, declined', () => {
      expect(nounPhrase(np(BUCH, {}, { possessor: np(VERWANDT) }), 'nom')).toBe('das Buch des Verwandten');
    });

    test('a compound declines on its last element', () => {
      expect(nounPhrase(np(VERWANDT, { definiteness: 'indefinite' }, { nounModifiers: [nounModifier(BUCH)] }), 'nom'))
        .toBe('ein Buchverwandter');
    });
  });
});
