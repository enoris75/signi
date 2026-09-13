import { describe, expect, test } from 'vitest';
import { adj, DU, ER, ICH, KATER, KATZE, KLEIN, MAN, np } from './de.fixtures.js';
import { subjectPhrase } from './subjectPhrase.js';

describe('subjectPhrase', () => {
  test('a pronoun renders its base form', () => {
    expect(subjectPhrase(np(ICH))).toBe('ich');
    expect(subjectPhrase(np(ER))).toBe('er');
    expect(subjectPhrase(np(MAN))).toBe('man');
  });

  test('a plural pronoun renders its plural form', () => {
    expect(subjectPhrase(np(ICH, { number: 'plural' }))).toBe('wir');
    expect(subjectPhrase(np(DU, { number: 'plural' }))).toBe('ihr');
    expect(subjectPhrase(np(ER, { number: 'plural' }))).toBe('sie');
  });

  test('a noun renders as a nominative noun phrase', () => {
    expect(subjectPhrase(np(KATER, {}, { adjectives: [adj(KLEIN)] }))).toBe('der kleine Kater');
    expect(subjectPhrase(np(KATZE, { number: 'plural' }))).toBe('die Katzen');
  });
});
