import { describe, expect, test } from 'vitest';
import { adjPhrase } from './adjPhrase.js';
import { adj, ALT, type Forms, GESCHWINDIGKEIT, GROSS, GUT, HAUS, HOCH, KATER, KATZE, KLEIN, MUEDE, np, SORGFALT, WASSER } from './de.fixtures.js';

const SCHOEN: Forms = { role: 'adjective', base: 'schön' };
/** YOUNG_WOMAN: the head carries "jung" as an inherent adjective ("die junge Frau"). */
const FRAU: Forms = { base: 'Frau', plural: 'Frauen', adjective: 'jung', gender: 'fem', count: 'singular' };

describe('adjPhrase', () => {
  test('is empty when the phrase has no adjectives', () => {
    expect(adjPhrase(np(KATER), 'nom')).toBe('');
  });

  test('declines for case and determiner, defaulting to the definite article', () => {
    const phrase = np(KATER, {}, { adjectives: [adj(KLEIN)] });
    expect(adjPhrase(phrase, 'nom')).toBe('kleine');
    expect(adjPhrase(phrase, 'acc')).toBe('kleinen');
    expect(adjPhrase(phrase, 'nom', 'indefinite')).toBe('kleiner');
  });

  // A mass noun has no "ein Wasser" and takes the invariant "etwas / viel / wenig", so nothing but
  // the adjective carries the case.
  test('declines strong on a mass noun whose determiner leaves no article', () => {
    expect(adjPhrase(np(WASSER, {}, { adjectives: [adj(GUT)] }), 'dat', 'some')).toBe('gutem');
    expect(adjPhrase(np(WASSER, {}, { adjectives: [adj(GUT)] }), 'dat', 'indefinite')).toBe('gutem');
    expect(adjPhrase(np(SORGFALT, {}, { adjectives: [adj(GUT)] }), 'gen', 'indefinite')).toBe('guter');
    // A determiner with an ending of its own still carries the case: "mit keinem guten Wasser".
    expect(adjPhrase(np(WASSER, {}, { adjectives: [adj(GUT)] }), 'dat', 'no')).toBe('guten');
    expect(adjPhrase(np(HAUS, {}, { adjectives: [adj(GUT)] }), 'dat', 'indefinite')).toBe('guten');
  });

  test('agrees with the head’s gender and number', () => {
    expect(adjPhrase(np(HAUS, {}, { adjectives: [adj(GROSS)] }), 'nom', 'indefinite')).toBe('großes');
    expect(adjPhrase(np(HAUS, { number: 'plural' }, { adjectives: [adj(GROSS)] }), 'nom', 'bare')).toBe('große');
  });

  test('declines each of several adjectives', () => {
    expect(adjPhrase(np(KATER, {}, { adjectives: [adj(KLEIN), adj(MUEDE)] }), 'acc')).toBe('kleinen müden');
  });

  test('declines the comparative, superlative and seeded attributive stems', () => {
    expect(adjPhrase(np(KATER, {}, { adjectives: [adj(ALT, { degree: 'more' })] }), 'nom')).toBe('ältere');
    expect(adjPhrase(np(KATZE, {}, { adjectives: [adj(GUT, { degree: 'most' })] }), 'dat')).toBe('besten');
    expect(adjPhrase(np(GESCHWINDIGKEIT, {}, { adjectives: [adj(HOCH)] }), 'nom')).toBe('hohe');
  });

  test('prefixes a periphrastic degree adverb to the declined adjective', () => {
    expect(adjPhrase(np(KATER, {}, { adjectives: [adj(KLEIN, { degree: 'less' })] }), 'nom', 'indefinite')).toBe('weniger kleiner');
    expect(adjPhrase(np(HAUS, { number: 'plural' }, { adjectives: [adj(GROSS, { degree: 'least' })] }), 'nom')).toBe('am wenigsten großen');
  });

  test('declines the head’s inherent adjective, closest to the noun', () => {
    expect(adjPhrase(np(FRAU), 'dat', 'indefinite')).toBe('jungen');
    expect(adjPhrase(np(FRAU, { number: 'plural' }, { adjectives: [adj(SCHOEN)] }), 'nom')).toBe('schönen jungen');
  });

  test('skips an adjective with no German base', () => {
    expect(adjPhrase(np(KATER, {}, { adjectives: [adj({ role: 'adjective' }), adj(KLEIN)] }), 'nom')).toBe('kleine');
  });
});
