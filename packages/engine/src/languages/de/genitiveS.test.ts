import { describe, expect, test } from 'vitest';
import { BOOT, HAUS, KATER, KATZE, WORT } from './de.fixtures.js';
import { genitiveS } from './genitiveS.js';

const MASC = { gender: 'masc' };

describe('genitiveS', () => {
  test('a monosyllable takes -es', () => {
    expect(genitiveS('Wort', 'gen', WORT, false)).toBe('Wortes');
    expect(genitiveS('Boot', 'gen', BOOT, false)).toBe('Bootes');
  });

  test('a longer word takes a bare -s', () => {
    expect(genitiveS('Kater', 'gen', KATER, false)).toBe('Katers');
    expect(genitiveS('Mädchen', 'gen', { gender: 'neut' }, false)).toBe('Mädchens');
  });

  test('a sibilant-final word takes -es whatever its length', () => {
    expect(genitiveS('Haus', 'gen', HAUS, false)).toBe('Hauses');
    expect(genitiveS('Prozess', 'gen', MASC, false)).toBe('Prozesses');
    expect(genitiveS('Umsatz', 'gen', MASC, false)).toBe('Umsatzes');
    expect(genitiveS('Reflex', 'gen', MASC, false)).toBe('Reflexes');
  });

  test('a missing gender counts as neuter', () => {
    expect(genitiveS('Wasser', 'gen', {}, false)).toBe('Wassers');
  });

  test('a feminine, a plural or another case takes no ending', () => {
    expect(genitiveS('Katze', 'gen', KATZE, false)).toBe('Katze');
    expect(genitiveS('Wörter', 'gen', WORT, true)).toBe('Wörter');
    expect(genitiveS('Wort', 'dat', WORT, false)).toBe('Wort');
    expect(genitiveS('', 'gen', WORT, false)).toBe('');
  });
});
