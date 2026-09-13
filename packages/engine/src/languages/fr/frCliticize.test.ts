import { describe, expect, test } from 'vitest';
import { frCliticize } from './frCliticize.js';

describe('frCliticize', () => {
  test('is a no-op without a clitic', () => {
    expect(frCliticize('', 'voit')).toBe('voit');
    expect(frCliticize('', 'ne voit pas')).toBe('ne voit pas');
  });

  test('puts the clitic before the verb', () => {
    expect(frCliticize('me', 'voit')).toBe('me voit');
    expect(frCliticize('la', 'voient')).toBe('la voient');
    expect(frCliticize('les', 'voit')).toBe('les voit');
  });

  test('elides me, te, le, la and se before a vowel', () => {
    expect(frCliticize('me', 'aime')).toBe("m'aime");
    expect(frCliticize('te', 'écoute')).toBe("t'écoute");
    expect(frCliticize('la', 'aime')).toBe("l'aime");
    expect(frCliticize('le', 'a vu')).toBe("l'a vu");
  });

  test('nous, vous and les never elide', () => {
    expect(frCliticize('nous', 'aime')).toBe('nous aime');
    expect(frCliticize('vous', 'a vu')).toBe('vous a vu');
    expect(frCliticize('les', 'aime')).toBe('les aime');
  });

  test('sits inside a leading ne', () => {
    expect(frCliticize('me', 'ne voit pas')).toBe('ne me voit pas');
    expect(frCliticize('les', 'ne voit jamais')).toBe('ne les voit jamais');
  });
});
