import { describe, expect, test } from 'vitest';
import { GROSS, KATER, KATZE, MANN, WORT, adj, el, np } from './de.fixtures.js';
import { dePredSuperlative } from './dePredSuperlative.js';

const most = adj(GROSS, { degree: 'most', domain: '1' });
const plural = { definiteness: 'definite', number: 'plural' };

describe('dePredSuperlative', () => {
  test('the article and the weak superlative, lower-case, in the gender of a plural noun set', () => {
    expect(dePredSuperlative(most, KATER, el(np(WORT, plural)))).toBe('das größte');
    expect(dePredSuperlative(most, KATER, el(np(KATZE, plural)))).toBe('die größte');
  });

  test('the subject\'s gender for a singular, a pronoun or a coordinated set', () => {
    expect(dePredSuperlative(most, KATZE, el(np(WORT, { definiteness: 'definite' })))).toBe('die größte');
    expect(dePredSuperlative(most, KATER, el(np(WORT, plural), np(KATZE, plural)))).toBe('der größte');
    expect(dePredSuperlative(most, KATER, undefined)).toBe('der größte');
  });

  test('the number is the subject\'s', () => {
    expect(dePredSuperlative(most, { ...MANN, number: 'plural' }, el(np(WORT, plural)))).toBe('die größten');
  });

  test('least keeps its periphrastic "am wenigsten" inside the article', () => {
    expect(dePredSuperlative(adj(GROSS, { degree: 'least', domain: '1' }), KATER, el(np(WORT, plural)))).toBe('das am wenigsten große');
  });

  test('a superlative intensifier leads the article', () => {
    const far = adj(GROSS, { degree: 'most', domain: '1', intensifier: 'bei weitem', intensifier_superlative: '1' });
    expect(dePredSuperlative(far, KATER, el(np(WORT, plural)))).toBe('bei weitem das größte');
  });
});
