import { describe, expect, test } from 'vitest';
import { frontQuestion } from './frontQuestion.js';

describe('frontQuestion', () => {
  test('the word ahead of est-ce que, que eliding before it', () => {
    expect(frontQuestion('que', 'le chat mange')).toBe("qu'est-ce que le chat mange");
    expect(frontQuestion('où', 'le chat mange')).toBe('où est-ce que le chat mange');
  });

  test('est-ce que elides before a vowel as the yes/no question does', () => {
    expect(frontQuestion('pourquoi', 'il mange')).toBe("pourquoi est-ce qu'il mange");
    expect(frontQuestion('que', 'elle mange')).toBe("qu'est-ce qu'elle mange");
  });
});
