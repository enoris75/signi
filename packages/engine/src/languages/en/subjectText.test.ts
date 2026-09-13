import { describe, expect, test } from 'vitest';
import { adj, BIG, CAT, DOG, EAT, el, group, I, MOUSE, np, ONE, THEY, vp } from './en.fixtures.js';
import { subjectText } from './subjectText.js';

describe('subjectText', () => {
  test('a single noun or pronoun subject', () => {
    expect(subjectText(el(np(CAT, { definiteness: 'indefinite' }, { adjectives: [adj(BIG)] })))).toBe('a big cat');
    expect(subjectText(el(np(THEY)))).toBe('they');
    expect(subjectText(el(np(ONE)))).toBe('one');
  });

  test('coordinates the conjuncts, each rendered on its own', () => {
    expect(subjectText(el(np(CAT), np(DOG), np(MOUSE)))).toBe('the cat, the dog and the mouse');
    expect(subjectText(group('or', np(CAT), np(DOG, { number: 'plural' })))).toBe('the cat or the dogs');
    expect(subjectText(el(np(I), np(CAT)))).toBe('I and the cat');
  });

  test('each conjunct keeps its own relative clause', () => {
    const catThatEats = np(CAT, {}, { relative: { headRole: 'subject', verbPhrase: vp(EAT) } });
    expect(subjectText(el(catThatEats))).toBe('the cat that eats');
    expect(subjectText(el(catThatEats, np(DOG)))).toBe('the cat that eats and the dog');
  });
});
