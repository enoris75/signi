import { describe, expect, test } from 'vitest';
import { CANSAT, clause, complement, complements, CORRER, DONA, GAT, np, SER, vp } from './ca.fixtures.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';

describe('infinitiveComplementText', () => {
  test('the link, then the bare infinitive, eliding de before a vowel', () => {
    expect(infinitiveComplementText(clause(np(GAT), vp(CORRER, { mood: 'infinitive' })), GAT, 'de')).toBe('de córrer');
    expect(infinitiveComplementText(clause(np(GAT), vp({ base: 'actuar' }, { mood: 'infinitive' })), GAT, 'de')).toBe("d'actuar");
  });

  test('the clause agrees with its controller', () => {
    const tired = clause(np(DONA), vp(SER, { mood: 'infinitive' }, 'BE'), { complements: complements({ predicative: complement(np(CANSAT)) }) });
    expect(infinitiveComplementText(tired, DONA, '')).toBe('estar cansada');
  });
});
