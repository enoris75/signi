import { describe, expect, test } from 'vitest';
import { declineAdj } from './declineAdj.js';
import type { Agr, Case } from './lt.types.js';

const M: Agr = { gender: 'masc', plural: false };
const F: Agr = { gender: 'fem', plural: false };
const MP: Agr = { gender: 'masc', plural: true };
const FP: Agr = { gender: 'fem', plural: true };
const CASES: Case[] = ['nom', 'gen', 'dat', 'acc', 'ins', 'loc'];
const row = (base: string, agr: Agr) => CASES.map((c) => declineAdj(base, c, agr)).join(', ');

describe('declineAdj', () => {
  test('-as: geras', () => {
    expect(row('geras', M)).toBe('geras, gero, geram, gerą, geru, gerame');
    expect(row('geras', F)).toBe('gera, geros, gerai, gerą, gera, geroje');
    expect(row('geras', MP)).toBe('geri, gerų, geriems, gerus, gerais, geruose');
    expect(row('geras', FP)).toBe('geros, gerų, geroms, geras, geromis, gerose');
  });

  test('-ias: žalias, and the superlative didžiausias', () => {
    expect(row('žalias', M)).toBe('žalias, žalio, žaliam, žalią, žaliu, žaliame');
    expect(row('žalias', MP)).toBe('žali, žalių, žaliems, žalius, žaliais, žaliuose');
    expect(row('didžiausias', F)).toBe('didžiausia, didžiausios, didžiausiai, didžiausią, didžiausia, didžiausioje');
  });

  test('-us: gražus, saldus softens', () => {
    expect(row('gražus', M)).toBe('gražus, gražaus, gražiam, gražų, gražiu, gražiame');
    expect(row('gražus', F)).toBe('graži, gražios, gražiai, gražią, gražia, gražioje');
    expect(row('gražus', MP)).toBe('gražūs, gražių, gražiems, gražius, gražiais, gražiuose');
    expect(row('gražus', FP)).toBe('gražios, gražių, gražioms, gražias, gražiomis, gražiose');
    expect(declineAdj('saldus', 'dat', M)).toBe('saldžiam');
  });

  test('-is: didelis, and the comparative geresnis', () => {
    expect(row('didelis', M)).toBe('didelis, didelio, dideliam, didelį, dideliu, dideliame');
    expect(row('didelis', F)).toBe('didelė, didelės, didelei, didelę, didele, didelėje');
    expect(row('didelis', MP)).toBe('dideli, didelių, dideliems, didelius, dideliais, dideliuose');
    expect(row('geresnis', FP)).toBe('geresnės, geresnių, geresnėms, geresnes, geresnėmis, geresnėse');
  });

  test('the genderless neuter, and an undeclinable base', () => {
    expect(declineAdj('geras', 'nom', { gender: 'neut', plural: false }, 'gera')).toBe('gera');
    expect(declineAdj('gražus', 'nom', { gender: 'neut', plural: false }, 'gražu')).toBe('gražu');
    expect(declineAdj('gražus', 'gen', { gender: 'neut', plural: false }, 'gražu')).toBe('gražaus');
    expect(declineAdj('ok', 'gen', M)).toBe('ok');
  });
});
