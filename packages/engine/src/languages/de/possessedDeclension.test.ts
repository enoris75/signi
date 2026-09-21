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

  test('any other phrase declines after its own determiner, definite by default', () => {
    expect(possessedDeclension(np(KATER, { definiteness: 'indefinite' }))).toBe('indefinite');
    expect(possessedDeclension(np(KATER))).toBe('definite');
    expect(possessedDeclension(np(KATER, {}, { possessor: np(KATER) }), { definiteness: 'this' })).toBe('this');
  });
});
