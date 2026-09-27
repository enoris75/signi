import { describe, expect, test } from 'vitest';
import { BORROWED, concepts, RM_VALLADER } from '../index.js';

// P04-E6: the Vallader column. Every form is a draft (verify) until the variety's review (E19).
const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'];
const TENSES = ['present', 'imperfect', 'conditional', 'subjunctive'];
const own = (role: string) => concepts.filter((c) => c.role === role && !BORROWED['rm-vallader']?.includes(c.id));
const v = (id: string) => RM_VALLADER[id]!;

describe('the Vallader column (P04-E6)', () => {
  test('gives every concept its own Vallader word — none borrowed from Rumantsch Grischun', () => {
    // The worklist of concepts with no Vallader word yet. Empty: every concept is drafted; a
    // concept is left out (and so borrowed) only where no Vallader word can be given.
    expect(BORROWED['rm-vallader']).toEqual([]);
  });

  test('gives every own verb its 6×4 finite cells, its participle and the three imperatives', () => {
    const cells = [
      'base', 'participle', '2sg_imperative', '1pl_imperative', '2pl_imperative',
      ...TENSES.flatMap((t) => PERSONS.map((p) => `${p}_${t}`)),
    ];
    const bad = own('verb').flatMap((c) => cells.filter((k) => !c.forms['rm-vallader']?.[k]).map((k) => `${c.id}.${k}`));
    expect(bad).toEqual([]);
  });

  test('stores no past, future or gerund — they are periphrastic (P04 D5, D7)', () => {
    const bad = concepts.flatMap((c) =>
      Object.keys(RM_VALLADER[c.id] ?? {}).filter((k) => /_(past|future)$/.test(k) || k === 'gerund').map((k) => `${c.id}.${k}`),
    );
    expect(bad).toEqual([]);
  });

  test('gives every own noun a base and a gender, masculine or feminine', () => {
    const bad = own('noun').filter((c) => !c.forms['rm-vallader']?.['base'] || !['masc', 'fem'].includes(c.forms['rm-vallader']?.['gender'] ?? ''));
    expect(bad.map((c) => c.id)).toEqual([]);
  });

  test('gives every own adjective its four agreeing forms', () => {
    const bad = own('adjective').flatMap((c) =>
      ['base', 'fem', 'masc_plural', 'fem_plural'].filter((k) => !c.forms['rm-vallader']?.[k]).map((k) => `${c.id}.${k}`),
    );
    expect(bad).toEqual([]);
  });

  test('mirrors every non-conjugation key of the Italian entry', () => {
    const conjugation = /^[123](sg|pl)_(present|past|future)$/;
    const bad = concepts.flatMap((c) => {
      const mine = RM_VALLADER[c.id];
      if (!mine) return [];
      return Object.keys(c.forms['it'] ?? {}).filter((k) => !conjugation.test(k) && !(k in mine)).map((k) => `${c.id}.${k}`);
    });
    expect(bad).toEqual([]);
  });

  test('spells the sharpest Vallader markers', () => {
    expect(v('CAT')).toMatchObject({ base: 'giat', plural: 'giats', gender: 'masc', fem: 'giatta' });
    expect(v('DOG')).toMatchObject({ base: 'chan' }); // not Puter chaun
    // esser: eu sun, tü est, el es, nus eschan, vus eschat, els sun.
    expect(PERSONS.map((p) => v('BE')[`${p}_present`])).toEqual(['sun', 'est', 'es', 'eschan', 'eschat', 'sun']);
    expect(v('BE')).toMatchObject({ copula: '1', aux: 'be', participle: 'stat', '3sg_conditional': 'füss', '3sg_imperfect': "d'eira" });
    expect(PERSONS.map((p) => v('HAVE')[`${p}_present`])).toEqual(["n'ha", 'hast', 'ha', 'vain', 'vais', 'han']);
    expect(PERSONS.map((p) => v('COME')[`${p}_present`])).toEqual(['vegn', 'vainst', 'vain', 'gnin', 'gnis', 'vegnan']);
    expect(v('GO')).toMatchObject({ base: 'ir', '3sg_present': 'va', '1pl_present': 'giain', participle: 'i', aux: 'be' });
    expect(v('MAKE')).toMatchObject({ base: 'far', '1sg_present': 'fetsch', participle: 'fat' });
    expect(v('MUST')).toMatchObject({ base: 'stuvair', '1sg_present': 'stögl', '3sg_present': 'sto' });
    expect(v('WILL')).toMatchObject({ base: 'vulair', '1sg_present': 'vögl', '3sg_present': 'voul' });
    expect(v('EAT')).toMatchObject({ '3sg_present': 'mangia', '1pl_present': 'mangiain', participle: 'mangià' });
    expect(v('FIRST_PERSON')).toMatchObject({ base: 'eu', plural: 'nus' });
    expect(v('SECOND_PERSON')).toMatchObject({ base: 'tü' });
    expect(v('GENERIC_PERSON')).toMatchObject({ base: 'ins', generic: '1' });
    expect(v('SOMETHING')).toMatchObject({ base: 'alch', negative: 'nöglia' }); // not Puter ünguotta
    expect(v('SOMEONE')).toMatchObject({ negative: 'ingün' }); // not Puter üngün
  });

  test('writes the language names lowercase', () => {
    const names = concepts.filter((c) => c.role === 'noun' && c.isA === 'LANGUAGE').map((c) => RM_VALLADER[c.id]?.['base'] ?? '');
    expect(names.filter((n) => n !== n.toLowerCase())).toEqual([]);
    expect(v('ROMANSH')['base']).toBe('rumantsch');
    expect(v('VALLADER')['base']).toBe('vallader');
  });
});
