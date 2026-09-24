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

  // A93: "ne" is judged against the clitic, never left elided before one.
  test('restores a ne elided against a vowel-initial verb', () => {
    expect(frCliticize('me', "n'aime pas")).toBe("ne m'aime pas");
    expect(frCliticize('le', "n'a pas vu")).toBe("ne l'a pas vu");
    expect(frCliticize('nous', "n'aime jamais")).toBe('ne nous aime jamais');
  });

  // A121: the locative pro-form "y" is no vowel to VOWEL_START, but "ne" elides before it all the same.
  test('ne elides before y', () => {
    expect(frCliticize('y', "n'est pas")).toBe("n'y est pas");
    expect(frCliticize('y', 'ne sera pas')).toBe("n'y sera pas");
    expect(frCliticize('y', 'est')).toBe('y est');
  });

  // localization B86: a pronominal verb with a direct object (se rappeler) keeps its own clitic first,
  // and that one is judged again against the object clitic after it.
  test('a pronominal verb keeps its own clitic ahead of the object', () => {
    expect(frCliticize('le', 'se rappelle')).toBe('se le rappelle');
    expect(frCliticize('la', 'me rappelle')).toBe('me la rappelle');
    expect(frCliticize('les', 'nous rappelons')).toBe('nous les rappelons');
    expect(frCliticize('le', "s'est rappelé")).toBe("se l'est rappelé");
    expect(frCliticize('le', 'ne se rappelle pas')).toBe('ne se le rappelle pas');
    expect(frCliticize('le', "ne s'est pas rappelé")).toBe("ne se l'est pas rappelé");
    expect(frCliticize('y', "s'arrête")).toBe("s'y arrête");
    expect(frCliticize('y', "ne s'arrête pas")).toBe("ne s'y arrête pas");
  });
});
