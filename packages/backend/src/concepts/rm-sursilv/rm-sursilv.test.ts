import { describe, expect, test } from 'vitest';
import { concepts, RM_SURSILV, BORROWED } from '../index.js';

const own = (role: string) => concepts.filter((c) => c.role === role && RM_SURSILV[c.id]);
const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'];
const TENSES = ['present', 'imperfect', 'conditional', 'subjunctive'];

describe('the Sursilvan column (P04-E5)', () => {
  test('every concept has its own Sursilvan word: nothing is borrowed from Rumantsch Grischun', () => {
    // A concept left out of the column borrows RG's forms at merge time and is listed here, with the
    // reason it has no Sursilvan word yet. Today every concept is drafted (all (verify), P04-E19).
    expect(BORROWED['rm-sursilv']).toEqual([]);
    for (const c of concepts) expect(c.forms['rm-sursilv'], c.id).toBe(RM_SURSILV[c.id]);
  });

  test('every own verb has the 6×4 finite cells, the participle and the three imperatives', () => {
    for (const c of own('verb')) {
      const f = RM_SURSILV[c.id];
      for (const tense of TENSES) for (const p of PERSONS) expect(f[`${p}_${tense}`], `${c.id} ${p}_${tense}`).toBeTruthy();
      expect(f.base, c.id).toBeTruthy();
      expect(f.participle, c.id).toBeTruthy();
      for (const k of ['2sg_imperative', '1pl_imperative', '2pl_imperative']) expect(f[k], `${c.id} ${k}`).toBeTruthy();
    }
  });

  test('no verb stores a simple past, a synthetic future or a gerund (P04 D5, D7)', () => {
    for (const c of own('verb')) {
      const bad = Object.keys(RM_SURSILV[c.id]).filter((k) => /_past$|_future$|^gerund$/.test(k));
      expect(bad, c.id).toEqual([]);
    }
  });

  test('every own verb keeps the syntactic keys of its Italian entry', () => {
    const conj = /^(1|2|3)(sg|pl)_|^(base|participle|gerund|aux)$/;
    // Re-decided in verbs.ts: bandunar takes the place left as a direct object. (aux is a
    // conjugation choice, not a syntactic key: DEPEND, LIKE, BEGIN take haver in Sursilvan.)
    const dropped: Record<string, string[]> = { LEAVE: ['object_prep'] };
    for (const c of own('verb')) {
      const keys = Object.keys(c.forms.it ?? {}).filter((k) => !conj.test(k) && !(dropped[c.id] ?? []).includes(k));
      for (const k of keys) expect(RM_SURSILV[c.id][k], `${c.id} ${k}`).toBeDefined();
    }
  });

  test('every own noun has a base and a gender', () => {
    for (const c of own('noun')) {
      expect(RM_SURSILV[c.id].base, c.id).toBeTruthy();
      expect(['masc', 'fem'], c.id).toContain(RM_SURSILV[c.id].gender);
    }
  });

  test('every own adjective has its four agreeing forms and the predicative masculine singular', () => {
    for (const c of own('adjective')) {
      for (const k of ['base', 'fem', 'masc_plural', 'fem_plural', 'predicative_masc_sg']) {
        expect(RM_SURSILV[c.id][k], `${c.id} ${k}`).toBeTruthy();
      }
    }
  });

  test('spot checks — Sursilvan, not Rumantsch Grischun respelt', () => {
    expect(RM_SURSILV.CAT).toMatchObject({ base: 'gat', plural: 'gats', fem: 'gatta' });
    expect(RM_SURSILV.GOOD).toMatchObject({ base: 'bun', fem: 'buna', predicative_masc_sg: 'buns' });
    expect(RM_SURSILV.BE).toMatchObject({ '1sg_present': 'sun', '3sg_present': 'ei', '3pl_present': 'ein', participle: 'stau', aux: 'be' });
    expect(RM_SURSILV.EAT).toMatchObject({ base: 'magliar', participle: 'magliau' });
    expect(RM_SURSILV.GO).toMatchObject({ '1sg_present': 'mon', '1pl_present': 'mein', aux: 'be' });
    expect(RM_SURSILV.WILL).toMatchObject({ '1sg_present': 'vi', '1pl_present': 'lein', '2pl_present': 'leis' });
    expect(RM_SURSILV.FIRST_PERSON.base).toBe('jeu');
    expect(RM_SURSILV.GENERIC_PERSON.base).toBe('ins');
    expect(RM_SURSILV.ROMANSH.base).toBe('romontsch');
  });
});
