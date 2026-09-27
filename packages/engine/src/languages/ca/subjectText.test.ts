import { describe, expect, test } from 'vitest';
import { el, GAT, GOS, HOME, np } from './ca.fixtures.js';
import { subjectText } from './subjectText.js';

describe('subjectText', () => {
  test('each conjunct with its article, coordinated, the orthography applied', () => {
    expect(subjectText(el(np(HOME), np(GOS)))).toBe("l'home i el gos");
  });

  test('a focus particle stands before the whole slot', () => {
    expect(subjectText(el(np(GAT, {}, { focus: 'only' })))).toBe('només el gat');
  });
});
