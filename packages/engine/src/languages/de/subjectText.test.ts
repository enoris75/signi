import { describe, expect, test } from 'vitest';
import { adj, el, ER, group, ICH, JUNGE, KATER, KATZE, KLEIN, MAN, np } from './de.fixtures.js';
import { subjectText } from './subjectText.js';

describe('subjectText', () => {
  test('a noun subject in the nominative', () => {
    expect(subjectText(el(np(KATER, { definiteness: 'indefinite' }, { adjectives: [adj(KLEIN)] })))).toBe('ein kleiner Kater');
    expect(subjectText(el(np(JUNGE)))).toBe('der Junge');
  });

  test('a pronoun subject takes its citation form, plural when plural', () => {
    expect(subjectText(el(np(ICH)))).toBe('ich');
    expect(subjectText(el(np(ICH, { number: 'plural' })))).toBe('wir');
    expect(subjectText(el(np(ER, { number: 'plural' })))).toBe('sie');
    expect(subjectText(el(np(MAN)))).toBe('man');
  });

  test('coordinates the conjuncts, each in the nominative', () => {
    expect(subjectText(el(np(KATER), np(KATZE), np(JUNGE)))).toBe('der Kater, die Katze und der Junge');
    expect(subjectText(el(np(ER), np(ICH)))).toBe('er und ich');
    expect(subjectText(group('or', np(KATER), np(KATZE)))).toBe('der Kater oder die Katze');
  });
});
