import { describe, expect, test } from 'vitest';
import { concepts, RM_RUMGR, BORROWED } from '../index.js';

// P04-E4: the Rumantsch Grischun verbs. Every form is (verify) until P04-E19.
describe('the Rumantsch Grischun verbs', () => {
  const verbs = concepts.filter((c) => c.role === 'verb');
  const own = verbs.filter((c) => RM_RUMGR[c.id]);
  const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'];
  const TENSES = ['present', 'imperfect', 'conditional', 'subjunctive'];
  const REQUIRED = [
    'base',
    ...TENSES.flatMap((t) => PERSONS.map((p) => `${p}_${t}`)),
    'participle',
    '2sg_imperative',
    '1pl_imperative',
    '2pl_imperative',
  ];

  test('borrows no verb from Italian', () => {
    // A verb listed here has no RG form yet and takes Italian's at merge time; each needs a reason.
    expect(verbs.filter((c) => BORROWED['rm-rumgr']?.includes(c.id)).map((c) => c.id)).toEqual([]);
  });

  test('gives every own verb its base, the 6×4 finite cells, a participle and three imperatives', () => {
    const missing = own.flatMap((c) =>
      REQUIRED.filter((k) => !RM_RUMGR[c.id]![k]?.trim()).map((k) => `${c.id}.${k}`),
    );
    expect(missing).toEqual([]);
  });

  test('stores no simple past, future or gerund — they are periphrastic or absent (P04 D5, D7)', () => {
    const bad = own.flatMap((c) =>
      Object.keys(RM_RUMGR[c.id]!)
        .filter((k) => /_past$|_future$|^gerund$/.test(k))
        .map((k) => `${c.id}.${k}`),
    );
    expect(bad).toEqual([]);
  });

  test('carries every syntactic key the Italian entry carries', () => {
    const syntactic = /^(infinitive_link|object_prep|direction_prep|topic_prep|object_case|content_clause_force|content_clause_mood|nonfinite|copula|experiencer|seeming|causative|terminus_tonic|object_predicative_link|object_sense|infinitive_sense)$/;
    const missing = own.flatMap((c) =>
      Object.keys(c.forms['it'] ?? {})
        .filter((k) => syntactic.test(k) && !(k in RM_RUMGR[c.id]!))
        .map((k) => `${c.id}.${k}`),
    );
    expect(missing).toEqual([]);
  });

  test('conjugates the irregular core as the Pledari Grond does', () => {
    const present = (id: string) => PERSONS.map((p) => RM_RUMGR[id]![`${p}_present`]);
    expect(present('BE')).toEqual(['sun', 'es', 'è', 'essan', 'essas', 'èn']);
    expect(present('HAVE')).toEqual(['hai', 'has', 'ha', 'avain', 'avais', 'han']);
    expect(present('GO')).toEqual(['vom', 'vas', 'va', 'giain', 'giais', 'van']);
    expect(present('COME')).toEqual(['vegn', 'vegns', 'vegn', 'vegnin', 'vegnis', 'vegnan']);
    expect(present('MAKE')).toEqual(['fatsch', 'fas', 'fa', 'faschain', 'faschais', 'fan']);
    expect(present('MUST')).toEqual(['stoss', 'stos', 'sto', 'stuain', 'stuais', 'ston']);
    expect(RM_RUMGR['BE']!['3sg_conditional']).toBe('fiss');
    expect(RM_RUMGR['BE']!['3sg_subjunctive']).toBe('saja');
    expect(RM_RUMGR['SAY']!['participle']).toBe('ditg');
    expect(RM_RUMGR['GO']!['participle']).toBe('ì');
  });

  test('conjugates the regular classes as the Pledari Grond models do', () => {
    const eat = RM_RUMGR['EAT']!;
    expect([eat['1sg_present'], eat['1pl_present'], eat['3sg_imperfect'], eat['1sg_conditional'], eat['participle']]).toEqual(
      ['mangel', 'mangiain', 'mangiava', 'mangiass', 'mangià'],
    );
    const sell = RM_RUMGR['SELL']!;
    expect([sell['1sg_present'], sell['1pl_present'], sell['3sg_imperfect'], sell['3sg_subjunctive'], sell['participle']]).toEqual(
      ['vend', 'vendain', 'vendeva', 'vendia', 'vendì'],
    );
    const drink = RM_RUMGR['DRINK']!;
    expect([drink['3sg_present'], drink['1pl_present'], drink['1sg_conditional']]).toEqual(['baiva', 'bavain', 'bavess']);
    const understand = RM_RUMGR['UNDERSTAND']!;
    expect([understand['1sg_present'], understand['1pl_present'], understand['3sg_subjunctive'], understand['1sg_conditional']]).toEqual(
      ['chapesch', 'chapin', 'chapeschia', 'chapiss'],
    );
    expect(RM_RUMGR['RUN']!['1sg_present']).toBe('cur');
    expect(RM_RUMGR['LOVE']!['1sg_present']).toBe('charez');
  });

  test('selects esser for motion, change of state and reflexives', () => {
    const be = own.filter((c) => RM_RUMGR[c.id]!['aux'] === 'be').map((c) => c.id);
    expect(be).toEqual(expect.arrayContaining(['GO', 'COME', 'DIE', 'BECOME', 'BE', 'STOP_ONESELF', 'SIT_DOWN']));
    expect(be).not.toContain('EAT');
  });

  test('puts the reflexive clitic on every finite cell', () => {
    const sit = RM_RUMGR['SIT_DOWN']!;
    expect([sit['base'], sit['1sg_present'], sit['1pl_present'], sit['3pl_present'], sit['participle']]).toEqual(
      ['sa tschentar', 'ma tschent', 'ans tschentain', 'sa tschentan', 'tschentà'],
    );
  });
});
