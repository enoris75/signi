import { describe, expect, test } from 'vitest';
import { BOOT, EUROPA, HAUS, JUNGE, KATER, KATZE, SCHWEIZ, WORT } from './de.fixtures.js';
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

  // B09: the rules the genitive possessor needs beyond the monosyllable/sibilant split.
  test('a diphthong is one vowel sound, and a vowel-final word takes -s', () => {
    expect(genitiveS('Feuer', 'gen', { gender: 'neut' }, false)).toBe('Feuers');
    expect(genitiveS('Tier', 'gen', { gender: 'neut' }, false)).toBe('Tieres');
    expect(genitiveS('Gebäude', 'gen', { gender: 'neut' }, false)).toBe('Gebäudes');
    expect(genitiveS('Schnee', 'gen', MASC, false)).toBe('Schnees');
  });

  test('-sch takes -es, and -nis doubles its s', () => {
    expect(genitiveS('Geräusch', 'gen', { gender: 'neut' }, false)).toBe('Geräusches');
    expect(genitiveS('Ergebnis', 'gen', { gender: 'neut' }, false)).toBe('Ergebnisses');
    expect(genitiveS('Gefängnis', 'gen', { gender: 'neut' }, false)).toBe('Gefängnisses');
  });

  test('a weak masculine takes -(e)n, never -(e)s', () => {
    expect(genitiveS('Junge', 'gen', JUNGE, false)).toBe('Jungen');
    expect(genitiveS('Mensch', 'gen', { gender: 'masc', weak: '1' }, false)).toBe('Menschen');
  });

  test('a genitive the lexicon records wins, on a compound too', () => {
    const NAME = { base: 'Name', gender: 'masc', weak: '1', genitive: 'Namens' };
    expect(genitiveS('Name', 'gen', NAME, false)).toBe('Namens');
    expect(genitiveS('Vorname', 'gen', NAME, false)).toBe('Vornamens');
    expect(genitiveS('Numerus', 'gen', { base: 'Numerus', gender: 'masc', genitive: 'Numerus' }, false)).toBe('Numerus');
    expect(genitiveS('Name', 'dat', NAME, false)).toBe('Name');
  });

  test('a bare name takes -s whatever its gender, and nothing after a sibilant; an articled feminine none', () => {
    expect(genitiveS('Europa', 'gen', EUROPA, false)).toBe('Europas');
    expect(genitiveS('Asien', 'gen', { ...EUROPA, base: 'Asien' }, false)).toBe('Asiens');
    expect(genitiveS('Rom', 'gen', { ...EUROPA, base: 'Rom' }, false)).toBe('Roms');
    expect(genitiveS('Anna', 'gen', { base: 'Anna', gender: 'fem', proper: '1' }, false)).toBe('Annas');
    expect(genitiveS('Paris', 'gen', { ...EUROPA, base: 'Paris' }, false)).toBe('Paris');
    expect(genitiveS('Schweiz', 'gen', SCHWEIZ, false)).toBe('Schweiz');
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
