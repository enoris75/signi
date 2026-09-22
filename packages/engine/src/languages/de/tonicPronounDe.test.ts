import { describe, expect, test } from 'vitest';
import { tonicPronounDe } from './tonicPronounDe.js';

// The three surfaces `resolveNounPhrase` leaves on a German pronoun's forms: `base` is the
// nominative it has already put the person, number and gender into, `disjunctive` is the dative,
// and `object` (with its gendered keys) is the accusative.
const ER = { person: '3', base: 'er', disjunctive: 'ihm', object: 'ihn', object_fem: 'sie', object_neut: 'es', object_plural: 'sie' };

describe('tonicPronounDe', () => {
  test('the dative is the disjunctive form the seed spells', () => {
    expect(tonicPronounDe(ER, 'dat')).toBe('ihm');
    expect(tonicPronounDe({ ...ER, disjunctive: 'ihnen', number: 'plural' }, 'dat')).toBe('ihnen');
  });

  test('the accusative is the object form, by number and gender', () => {
    expect(tonicPronounDe(ER, 'acc')).toBe('ihn');
    expect(tonicPronounDe({ ...ER, gender: 'fem' }, 'acc')).toBe('sie');
    expect(tonicPronounDe({ ...ER, gender: 'neut' }, 'acc')).toBe('es');
    expect(tonicPronounDe({ ...ER, number: 'plural' }, 'acc')).toBe('sie');
  });

  test('the nominative after "wie" is the citation form', () => {
    expect(tonicPronounDe(ER, 'nom')).toBe('er');
    expect(tonicPronounDe({ ...ER, base: 'ich', disjunctive: 'mir', object: 'mich' }, 'nom')).toBe('ich');
  });

  test('a form the row does not spell falls back rather than emptying the slot', () => {
    expect(tonicPronounDe({ person: '3', base: '彼' }, 'acc')).toBe('彼');
    expect(tonicPronounDe({ person: '3', base: '彼' }, 'dat')).toBe('彼');
  });
});
