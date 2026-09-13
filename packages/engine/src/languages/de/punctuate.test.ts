import { describe, expect, test } from 'vitest';
import { punctuate } from './punctuate.js';

describe('punctuate', () => {
  test('pulls a leading comma back onto the preceding word', () => {
    expect(punctuate('man schneidet , indem man ein Messer wählt')).toBe('man schneidet, indem man ein Messer wählt');
  });

  test('collapses abutting commas into one', () => {
    expect(punctuate('der Junge sieht den Kater, der isst,, und der Mann geht')).toBe('der Junge sieht den Kater, der isst, und der Mann geht');
    expect(punctuate('man sieht den Kater, der isst, , indem man ein Messer wählt'))
      .toBe('man sieht den Kater, der isst, indem man ein Messer wählt');
  });

  test('drops a trailing comma, leaving the full stop to the translator', () => {
    expect(punctuate('der Junge sieht den Kater, der isst,')).toBe('der Junge sieht den Kater, der isst');
    expect(punctuate('der Junge sieht den Kater, der isst, ')).toBe('der Junge sieht den Kater, der isst');
  });

  test('leaves well-punctuated text alone', () => {
    expect(punctuate('wenn der Kater essen würde, würde der Mann gehen')).toBe('wenn der Kater essen würde, würde der Mann gehen');
  });
});
