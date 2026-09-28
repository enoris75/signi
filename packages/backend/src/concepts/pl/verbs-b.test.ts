import { describe, expect, test } from 'vitest';
import { verbs } from '../verbs/index.js';
import { PL_VERBS_B } from './verbs-b.js';

// P05-E5: the Polish verbs, part B. Every form is (verify) until the native review (P05-E11).
describe('the Polish verbs, part B', () => {
  const IDS = [
    'SET', 'PIN', 'UNPIN', 'COMPLETE', 'APPLY', 'NAME', 'DESCRIBE', 'MODIFY', 'SPECIFY', 'EDIT', 'GOVERN',
    'ACCEPT', 'NEGATE', 'ASSERT', 'EXPRESS', 'SAY', 'CALL', 'CALL_PHONE', 'MEAN', 'BELIEVE', 'REPLACE',
    'BREATHE', 'EXCHANGE', 'ENCLOSE', 'HEAR', 'GOVERN_STATE', 'ACCOMPANY', 'ANSWER', 'SEARCH', 'FIND', 'MEET',
    'ARRANGE', 'CONNECT', 'LET', 'ALLOW', 'LIKE', 'HELP_VERB', 'THANK', 'MARRY', 'RUN', 'JUMP', 'COME', 'CRY',
    'SUFFER', 'BURN', 'COLLAPSE', 'LIVE', 'LIVE_ALIVE', 'DIE', 'STAY', 'WAIT', 'TRADE', 'ACT', 'WORK',
    'WORK_LABOUR', 'PLAY_GAME', 'LOSE_GAME', 'BEGIN', 'STOP_DOING', 'STOP_ONESELF', 'CONTINUE_DOING',
    'CHANGE_ONESELF', 'LEARN', 'SPEAK', 'THINK', 'PRECEDE', 'FOLLOW', 'HAPPEN', 'GROW', 'FLOW', 'GIVE', 'SELL',
    'PAY', 'PROVIDE', 'TRANSFER', 'SHOW', 'SEND', 'TELL', 'TELL_ORDER', 'ASK', 'GO', 'RETURN', 'TURN',
    'LEAVE_DEPART', 'RUN_AWAY', 'GO_OUT', 'WALK', 'MOVE_ONESELF', 'SIT_DOWN', 'STAND_UP', 'BECOME', 'SEEM',
    'APPEAR', 'BE', 'BE_FARING', 'FLY', 'MUST', 'CAN', 'WILL', 'MAY', 'SHOULD', 'MIGHT',
  ];
  const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'];
  const PAST = ['masc', 'fem', 'neut', 'virile', 'nonvirile'];
  const entries = Object.entries(PL_VERBS_B);
  const f = (id: string) => PL_VERBS_B[id]!;
  const blank = (id: string, keys: string[]) => keys.filter((k) => !f(id)[k]?.trim()).map((k) => `${id}.${k}`);

  test('has an entry for every verb in its slice, and nothing else', () => {
    expect(IDS).toHaveLength(102);
    expect(Object.keys(PL_VERBS_B).sort()).toEqual([...IDS].sort());
  });

  test('holds only verbs', () => {
    const verbIds = new Set(verbs.map((c) => c.id));
    expect(IDS.filter((id) => !verbIds.has(id))).toEqual([]);
  });

  test('gives every verb its base, six present persons and five past forms', () => {
    const keys = ['base', ...PERSONS.map((p) => `${p}_present`), ...PAST.map((g) => `past_${g}`)];
    expect(IDS.flatMap((id) => blank(id, keys))).toEqual([]);
  });

  test('gives every perfective its six future persons and five past forms', () => {
    const keys = [...PERSONS.map((p) => `pf_${p}_future`), ...PAST.map((g) => `pf_past_${g}`)];
    const paired = entries.filter(([, e]) => e['pf_base']).map(([id]) => id);
    expect(paired.length).toBeGreaterThan(60);
    expect(paired.flatMap((id) => blank(id, keys))).toEqual([]);
  });

  test('stores no pf_ key without a pf_base', () => {
    const stray = entries.filter(([, e]) => !e['pf_base'] && Object.keys(e).some((k) => k.startsWith('pf_')));
    expect(stray.map(([id]) => id)).toEqual([]);
  });

  test('gives the modals no perfective and musieć/móc no imperative', () => {
    for (const id of ['MUST', 'CAN', 'WILL', 'MAY', 'SHOULD', 'MIGHT']) {
      expect(Object.keys(f(id)).filter((k) => k.startsWith('pf_')), id).toEqual([]);
    }
    for (const id of ['MUST', 'CAN']) expect(f(id)['2sg_imperative'], id).toBeUndefined();
    expect(f('MUST').base).toBe('musieć');
    expect(f('CAN').base).toBe('móc');
    expect(f('WILL').base).toBe('chcieć');
  });

  test('keeps się only on base and pf_base of a reflexive verb', () => {
    const reflexive = entries.filter(([, e]) => e['reflexive'] === '1');
    expect(reflexive.map(([id]) => id)).toEqual(expect.arrayContaining(['BECOME', 'LEARN', 'STOP_ONESELF', 'SEEM', 'APPEAR']));
    for (const [id, e] of reflexive) {
      expect(e['base'], id).toMatch(/ się$/);
      if (e['pf_base']) expect(e['pf_base'], id).toMatch(/ się$/);
    }
    const leaks = entries.flatMap(([id, e]) =>
      Object.entries(e).filter(([k, v]) => k !== 'base' && k !== 'pf_base' && /\bsię\b/.test(v)).map(([k]) => `${id}.${k}`),
    );
    expect(leaks).toEqual([]);
    // Only a reflexive verb carries się at all.
    expect(entries.filter(([, e]) => e['reflexive'] !== '1' && /się/.test(e['base']!)).map(([id]) => id)).toEqual([]);
  });

  test('stores the irregular forms', () => {
    expect(f('CAN')['3sg_present']).toBe('może');
    expect(f('CAN')['past_masc']).toBe('mógł');
    expect(f('CAN')['past_stem_masc']).toBe('mogł');
    expect(f('CAN')['past_virile']).toBe('mogli');
    expect(f('MUST')['past_virile']).toBe('musieli');
    expect(f('WILL')['past_virile']).toBe('chcieli');
    expect(f('BECOME')).toMatchObject({ base: 'stawać się', pf_base: 'stać się', pf_past_masc: 'stał', pf_past_virile: 'stali', pf_3sg_future: 'stanie' });
    expect(f('GO')).toMatchObject({ base: 'iść', pf_base: 'pójść', past_masc: 'szedł', past_fem: 'szła', pf_past_masc: 'poszedł', '3pl_present': 'idą' });
    expect(f('RUN')).toMatchObject({ base: 'biec', pf_base: 'pobiec', '1sg_present': 'biegnę', past_masc: 'biegł' });
    expect(f('FLY')).toMatchObject({ pf_base: 'polecieć', past_virile: 'lecieli' });
    expect(f('FIND')).toMatchObject({ pf_base: 'znaleźć', pf_past_masc: 'znalazł', pf_past_virile: 'znaleźli', pf_1sg_future: 'znajdę' });
    expect(f('HELP_VERB')).toMatchObject({ pf_past_masc: 'pomógł', pf_past_stem_masc: 'pomogł', pf_2sg_future: 'pomożesz', object_case: 'dat' });
    expect(f('GROW')).toMatchObject({ past_masc: 'rósł', past_stem_masc: 'rosł', past_virile: 'rośli' });
    expect(f('GIVE')).toMatchObject({ pf_3pl_future: 'dadzą', '1sg_present': 'daję', pf_2sg_imperative: 'daj' });
    expect(f('SEND')).toMatchObject({ pf_1sg_future: 'wyślę', pf_2sg_imperative: 'wyślij', pf_past_masc: 'wysłał' });
    expect(f('DIE')).toMatchObject({ pf_1sg_future: 'umrę', pf_past_masc: 'umarł', pf_past_virile: 'umarli' });
    expect(f('SIT_DOWN')).toMatchObject({ pf_past_masc: 'usiadł', pf_past_virile: 'usiedli', pf_2sg_imperative: 'usiądź' });
    expect(f('BE')).toMatchObject({ '3pl_present': 'są', '1sg_future': 'będę', '2sg_imperative': 'bądź', copula: '1' });
  });

  test('marks government where the object is not a plain accusative', () => {
    expect(f('SEARCH').object_case).toBe('gen');
    expect(f('LEARN').object_case).toBe('gen');
    expect(f('GOVERN').object_case).toBe('ins');
    expect(f('WAIT')).toMatchObject({ object_prep: 'na', object_prep_case: 'acc' });
    expect(f('CALL_PHONE')).toMatchObject({ object_prep: 'do', object_prep_case: 'gen' });
    expect(f('THINK')).toMatchObject({ topic_prep: 'o', topic_prep_case: 'loc' });
  });
});
