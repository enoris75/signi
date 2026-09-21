import { describe, expect, test } from 'vitest';
import { BESTIMMUNG_RICHTUNG, BOOT, GESCHWINDIGKEIT, GROESSE, JUNGE, KATZE, QUALITAET, SEGEL, WORT } from './de.fixtures.js';
import { compoundStem } from './compoundStem.js';

describe('compoundStem', () => {
  test('-s- after the feminine suffixes -ung/-heit/-keit/-schaft/-ion/-tät', () => {
    expect(compoundStem(GESCHWINDIGKEIT)).toBe('Geschwindigkeits');
    expect(compoundStem(QUALITAET)).toBe('Qualitäts');
    expect(compoundStem(BESTIMMUNG_RICHTUNG)).toBe('Bestimmungs');
    expect(compoundStem({ base: 'Freiheit', gender: 'fem' })).toBe('Freiheits');
    expect(compoundStem({ base: 'Wissenschaft', gender: 'fem' })).toBe('Wissenschafts');
    expect(compoundStem({ base: 'Option', gender: 'fem' })).toBe('Options');
  });

  // The feminine suffixes build only feminines: a masculine that merely ends the same way is bare.
  test('…but not after a masculine or neuter that only ends like one', () => {
    expect(compoundStem({ base: 'Sprung', gender: 'masc' })).toBe('Sprung');
    expect(compoundStem({ base: 'Ion', gender: 'neut' })).toBe('Ion');
  });

  test('-s- after -ling and -tum, whatever the gender', () => {
    expect(compoundStem({ base: 'Frühling', gender: 'masc' })).toBe('Frühlings');
    expect(compoundStem({ base: 'Wachstum', gender: 'neut' })).toBe('Wachstums');
  });

  test('-n- after a feminine -e, but not after a masculine or neuter one', () => {
    expect(compoundStem(KATZE)).toBe('Katzen');
    expect(compoundStem(GROESSE)).toBe('Größen');
    expect(compoundStem({ base: 'Gebäude', gender: 'neut' })).toBe('Gebäude');
  });

  test("a weak masculine's oblique -(e)n", () => {
    expect(compoundStem(JUNGE)).toBe('Jungen');
    expect(compoundStem({ base: 'Mensch', gender: 'masc', weak: '1' })).toBe('Menschen');
  });

  test('no linking element otherwise', () => {
    expect(compoundStem(WORT)).toBe('Wort');
    expect(compoundStem(SEGEL)).toBe('Segel');
    expect(compoundStem(BOOT)).toBe('Boot');
  });

  // The choice is partly lexical, so the lexicon's stem overrides every branch of the rule.
  test('a seeded compound stem wins', () => {
    expect(compoundStem({ base: 'Hund', gender: 'masc', compound: 'Hunde' })).toBe('Hunde');
    expect(compoundStem({ base: 'Sprache', gender: 'fem', compound: 'Sprach' })).toBe('Sprach');
    expect(compoundStem({ base: 'Name', gender: 'masc', weak: '1', compound: 'Namens' })).toBe('Namens');
  });

  test('a noun with no base has no stem', () => {
    expect(compoundStem({})).toBe('');
  });
});
