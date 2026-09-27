import { describe, expect, test } from 'vitest';
import { withChe } from './withChe.js';

describe('withChe', () => {
  test("che elides to ch' before a vowel", () => {
    expect(withChe('che', 'il giat mangia')).toBe("ch'il giat mangia");
    expect(withChe('che', 'el curra')).toBe("ch'el curra");
    expect(withChe('che', 'la giatta mangia')).toBe('che la giatta mangia');
  });

  test('a conjunction ending in che elides the same way', () => {
    expect(withChe('cura che', 'il chaun curra')).toBe("cura ch'il chaun curra");
    expect(withChe('perquai che', 'ella è stancla')).toBe("perquai ch'ella è stancla");
  });

  test("sche elides to sch'", () => {
    expect(withChe('sche', 'il chaun curriss')).toBe("sch'il chaun curriss");
    expect(withChe('sche', 'la giatta curriss')).toBe('sche la giatta curriss');
  });

  test('a word not ending in che joins plainly', () => {
    expect(withChe('nua', 'il giat mangia')).toBe('nua il giat mangia');
    expect(withChe('sco', 'ins spetga')).toBe('sco ins spetga');
  });

  test('an empty side leaves the other', () => {
    expect(withChe('che', '')).toBe('che');
    expect(withChe('', 'il giat mangia')).toBe('il giat mangia');
  });
});
