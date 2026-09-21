import { describe, expect, test } from 'vitest';
import type { PronominalPossessor } from '@signi/shared';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { adj, GROSS, KATER, np } from './de.fixtures.js';
import { adjPhrase } from './adjPhrase.js';
import { possessedDeclension } from './possessedDeclension.js';

const my: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'singular' };

describe('possessedDeclension', () => {
  test('a possessive is an ein-word, so the phrase declines as "kein" does, whatever determiner was picked', () => {
    expect(possessedDeclension(np(KATER, {}, { possessor: my }))).toBe('no');
    expect(possessedDeclension(np(KATER, { definiteness: 'indefinite' }, { possessor: my }))).toBe('no');
    const plural = np(KATER, { number: 'plural' }, { possessor: my });
    expect(possessedDeclension(plural, possessedHeadForms(plural, 'bare'))).toBe('no');
  });

  // A174: the plural takes the weak -en, which an `indefinite` (article-less) plural would not.
  test('the adjectives after a plural possessive take the weak -en, the singular the mixed ending', () => {
    const plural = np(KATER, { number: 'plural' }, { possessor: my, adjectives: [adj(GROSS)] });
    expect(adjPhrase(plural, 'nom', possessedDeclension(plural))).toBe('großen');
    expect(adjPhrase(plural, 'gen', possessedDeclension(plural))).toBe('großen');
    const singular = np(KATER, {}, { possessor: my, adjectives: [adj(GROSS)] });
    expect(adjPhrase(singular, 'nom', possessedDeclension(singular))).toBe('großer');
  });

  // A187: a head that kept its own determiner sends the possessive to a postnominal "von" phrase,
  // so the adjectives decline after that determiner. "alle ihre großen Bücher" is not one of those
  // — the possessive is still the ein-word in front of them — so `all` still declines as `no`.
  test('a head that kept its determiner declines after it, `all` still after the possessive', () => {
    expect(possessedDeclension(np(KATER, { definiteness: 'this' }, { possessor: my }))).toBe('this');
    expect(possessedDeclension(np(KATER, { definiteness: 'no' }, { possessor: my }))).toBe('no');
    expect(possessedDeclension(np(KATER, { number: 'plural', definiteness: 'some' }, { possessor: my }))).toBe('some');
    expect(possessedDeclension(np(KATER, { number: 'plural', definiteness: 'all' }, { possessor: my }))).toBe('no');
    const demonstrative = np(KATER, { definiteness: 'this' }, { possessor: my, adjectives: [adj(GROSS)] });
    expect(adjPhrase(demonstrative, 'nom', possessedDeclension(demonstrative))).toBe('große'); // weak, after "dieser"
  });

  test('any other phrase declines after its own determiner, definite by default', () => {
    expect(possessedDeclension(np(KATER, { definiteness: 'indefinite' }))).toBe('indefinite');
    expect(possessedDeclension(np(KATER))).toBe('definite');
    expect(possessedDeclension(np(KATER, {}, { possessor: np(KATER) }), { definiteness: 'this' })).toBe('this');
  });
});
