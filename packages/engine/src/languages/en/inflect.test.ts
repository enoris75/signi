import { describe, expect, test } from 'vitest';
import { inflect } from './inflect.js';

describe('inflect', () => {
  test('appends -er / -est to a plain base', () => {
    expect(inflect('small', 'er')).toBe('smaller');
    expect(inflect('old', 'est')).toBe('oldest');
  });

  test('drops the silent e before the suffix', () => {
    expect(inflect('large', 'er')).toBe('larger');
    expect(inflect('simple', 'est')).toBe('simplest');
  });

  test('turns a final consonant + y into i', () => {
    expect(inflect('happy', 'er')).toBe('happier');
    expect(inflect('lazy', 'est')).toBe('laziest');
  });

  test('keeps a y that follows a vowel', () => {
    expect(inflect('grey', 'er')).toBe('greyer');
  });

  test('doubles the final consonant of a consonant-vowel-consonant ending', () => {
    expect(inflect('big', 'er')).toBe('bigger');
    expect(inflect('sad', 'est')).toBe('saddest');
    expect(inflect('hot', 'er')).toBe('hotter');
  });

  test('does not double after two vowels, nor a final w, x or y', () => {
    expect(inflect('great', 'er')).toBe('greater');
    expect(inflect('new', 'er')).toBe('newer');
    expect(inflect('low', 'est')).toBe('lowest');
  });
});
