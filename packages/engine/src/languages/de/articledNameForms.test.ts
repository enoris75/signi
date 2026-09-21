import { describe, expect, test } from 'vitest';
import { adj, EUROPA, GROSS, KATER, np, SCHWEIZ } from './de.fixtures.js';
import { articledNameForms } from './articledNameForms.js';

describe('articledNameForms', () => {
  test('a bare-name place with an adjective is marked articled', () => {
    const bigEurope = np(EUROPA, {}, { adjectives: [adj(GROSS)] });
    expect(articledNameForms(bigEurope)).toEqual({ ...EUROPA, takes_article: '1' });
    expect(bigEurope.head.forms['takes_article']).toBeUndefined();
  });

  test('the bare name, an articled name and a common noun keep their forms', () => {
    const europe = np(EUROPA);
    expect(articledNameForms(europe)).toBe(europe.head.forms);
    const bigSwitzerland = np(SCHWEIZ, {}, { adjectives: [adj(GROSS)] });
    expect(articledNameForms(bigSwitzerland)).toBe(bigSwitzerland.head.forms);
    const bigCat = np(KATER, {}, { adjectives: [adj(GROSS)] });
    expect(articledNameForms(bigCat)).toBe(bigCat.head.forms);
  });

  test('a possessive fills the slot instead, and the forms passed in are the ones read', () => {
    const yourBigEurope = np(EUROPA, {}, { adjectives: [adj(GROSS)], possessor: { kind: 'pronominal', person: '2', number: 'singular' } });
    expect(articledNameForms(yourBigEurope)['takes_article']).toBeUndefined();
    const bigEurope = np(EUROPA, {}, { adjectives: [adj(GROSS)] });
    expect(articledNameForms(bigEurope, { ...EUROPA, definiteness: 'bare' })).toEqual({ ...EUROPA, definiteness: 'bare', takes_article: '1' });
  });
});
