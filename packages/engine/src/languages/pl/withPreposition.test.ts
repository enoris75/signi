import { describe, expect, test } from 'vitest';
import { withPreposition } from './withPreposition.js';

describe('withPreposition — the euphonic -e', () => {
  test('w → we', () => {
    expect(withPreposition('w', 'wtorek')).toBe('we wtorek');
    expect(withPreposition('w', 'mnie')).toBe('we mnie');
    expect(withPreposition('w', 'wodzie')).toBe('w wodzie');
    expect(withPreposition('w', 'domu')).toBe('w domu');
  });

  test('z → ze', () => {
    expect(withPreposition('z', 'szkoły')).toBe('ze szkoły');
    expect(withPreposition('z', 'mną')).toBe('ze mną');
    expect(withPreposition('z', 'wszystkimi')).toBe('ze wszystkimi');
    expect(withPreposition('z', 'sobą')).toBe('ze sobą');
    expect(withPreposition('z', 'psem')).toBe('z psem');
    expect(withPreposition('z', 'radością')).toBe('z radością');
  });

  test('the others before mn-', () => {
    expect(withPreposition('od', 'mnie')).toBe('ode mnie');
    expect(withPreposition('przed', 'mną')).toBe('przede mną');
    expect(withPreposition('od', 'domu')).toBe('od domu');
  });

  test('a phrase preposition and a bare case', () => {
    expect(withPreposition('z powodu', 'mnie')).toBe('z powodu mnie');
    expect(withPreposition('', 'kotu')).toBe('kotu');
  });
});
