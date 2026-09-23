import { describe, expect, test } from 'vitest';
import { subordinateText } from './subordinateText.js';

describe('subordinateText', () => {
  test('puts the clause behind its word', () => {
    expect(subordinateText('que', 'le chat court')).toBe('que le chat court');
    expect(subordinateText('parce que', 'le chat mange')).toBe('parce que le chat mange');
    expect(subordinateText('quand', 'le chat mange')).toBe('quand le chat mange');
  });

  test('elides a final "que" before a vowel', () => {
    expect(subordinateText('que', 'il court')).toBe("qu'il court");
    expect(subordinateText('parce que', 'on mange')).toBe("parce qu'on mange");
    expect(subordinateText('avant que', 'un chat mange')).toBe("avant qu'un chat mange");
  });

  test('"quand" and an elided article keep the word whole', () => {
    expect(subordinateText('quand', 'il mange')).toBe('quand il mange');
    expect(subordinateText('que', "l'homme court")).toBe("que l'homme court");
  });
});
