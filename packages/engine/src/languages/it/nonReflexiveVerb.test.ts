import { describe, expect, test } from 'vitest';
import { MANGIARE, MUOVERSI } from './it.fixtures.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';

describe('nonReflexiveVerb', () => {
  test('restores the infinitive and takes the clitic off every stored form', () => {
    const plain = nonReflexiveVerb({ conceptId: 'MOVE_ONESELF', forms: MUOVERSI });
    expect(plain.forms['base']).toBe('muovere');
    expect(plain.forms['3sg_present']).toBe('muove');
    expect(plain.forms['1pl_present']).toBe('muoviamo');
    expect(plain.forms['2pl_past']).toBe('muoveste');
    expect(plain.forms['1sg_future']).toBe('muoverò');
    expect(plain.forms['gerund']).toBe('muovendo');
    expect(plain.forms['participle']).toBe('mosso');
    expect(plain.conceptId).toBe('MOVE_ONESELF');
  });

  test('a pronominal verb selects essere', () => {
    const { aux: _unused, ...withoutAux } = MUOVERSI;
    expect(nonReflexiveVerb({ conceptId: 'TEST', forms: withoutAux }).forms['aux']).toBe('be');
  });

  test('a contracted infinitive gets its -rre back', () => {
    expect(nonReflexiveVerb({ conceptId: 'TEST', forms: { base: 'porsi' } }).forms['base']).toBe('porre');
    expect(nonReflexiveVerb({ conceptId: 'TEST', forms: { base: 'ridursi' } }).forms['base']).toBe('ridurre');
    expect(nonReflexiveVerb({ conceptId: 'TEST', forms: { base: 'alzarsi' } }).forms['base']).toBe('alzare');
  });

  test('returns any other verb unchanged', () => {
    const verb = { conceptId: 'EAT', forms: MANGIARE };
    expect(nonReflexiveVerb(verb)).toBe(verb);
  });
});
