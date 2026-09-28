import { describe, expect, test } from 'vitest';
import { concepts } from '../index.js';
import { LT_VERBS_A } from './verbs-a.js';

// P18-E6: the Lithuanian verbs, part A (Polish's `pl/verbs-a.ts` slice). Every form is (verify) until
// the native review (P18-E12); this pins the shape the engine reads (style-lt.md § Verbs) and the
// hard forms: the irregular presents, the primary verbs' corrections (`primary` in verbs-a.ts), the
// overrides, and the reflexive.
const IDS = [
  'CUT', 'EAT', 'EAT_ANIMAL', 'DRINK', 'POUR', 'CONSUME', 'SEE', 'LOVE', 'DESIRE', 'KILL', 'KNOW',
  'KNOW_ACQUAINTED', 'REMEMBER', 'CONSIDER', 'EXPECT', 'READ', 'CRY_OUT', 'BITE', 'BEAT', 'SET_ON_FIRE',
  'EXTINGUISH', 'BUY', 'OWN', 'HOLD', 'HOLD_GRASP', 'INCLUDE', 'CONFINE', 'TAME', 'MAKE', 'DO', 'CONTINUE',
  'PLAY_INSTRUMENT', 'NEED', 'TRY', 'CREATE', 'DESTROY', 'PERCEIVE', 'UNDERSTAND', 'HAVE', 'ACQUIRE',
  'TAKE', 'GET', 'PUT', 'KEEP', 'LOSE', 'WIN', 'BRING', 'LEAD', 'LEAVE_BEHIND', 'LOOK_AT', 'DIRECT_VERB',
  'DIVIDE', 'STRIKE', 'INDICATE', 'CHANGE', 'STOP', 'TRANSFORM', 'FEEL', 'SHED', 'PRODUCE', 'CAUSE_VERB',
  'PRESS', 'WRITE', 'CLICK', 'DEPEND', 'CHOOSE', 'FILTER', 'SELECT', 'TYPE', 'TRANSLATE', 'SAVE', 'LOAD',
  'ADD', 'LINK', 'EXPORT', 'BROADCAST', 'IMPORT', 'CLEAR', 'REMOVE', 'DELETE', 'COORDINATE', 'TIDY_UP',
  'COMPACT', 'EXPAND', 'SHRINK', 'HIDE', 'START', 'CANCEL', 'UNDO', 'REDO', 'RESTORE', 'OPEN', 'CLOSE',
  'RETRY', 'USE', 'SPEND_MONEY', 'SPEND_TIME', 'COPY', 'MOVE', 'LEAVE', 'RESIZE', 'DRAG', 'TURN_OFF',
];

const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'];
const TENSES = ['present', 'past', 'frequentative', 'future', 'conditional'];
/** Every cell `verb` stores for one aspect (style-lt.md § Verbs), without its `pf_` prefix. */
const CELLS = [
  'base',
  ...TENSES.flatMap((t) => PERSONS.map((p) => `${p}_${t}`)),
  '2sg_imperative', '1pl_imperative', '2pl_imperative',
  'adverbial', 'adverbial_fem', 'adverbial_plural', 'adverbial_fem_plural',
  'past_active', 'past_active_fem', 'past_active_plural', 'past_active_fem_plural',
  'passive', 'passive_fem', 'passive_plural', 'passive_fem_plural', 'passive_neut',
];
const entries = Object.entries(LT_VERBS_A);

describe('the Lithuanian verbs, part A (P18-E6)', () => {
  test('covers exactly the 103 verbs of the lane', () => {
    expect(IDS).toHaveLength(103);
    expect(Object.keys(LT_VERBS_A).sort()).toEqual([...IDS].sort());
  });

  test('holds only verb concepts', () => {
    const bad = Object.keys(LT_VERBS_A).filter((id) => concepts.find((c) => c.id === id)?.role !== 'verb');
    expect(bad).toEqual([]);
  });

  test('stores the base, the six presents, pasts and futures of every verb', () => {
    const keys = ['base', ...['present', 'past', 'future'].flatMap((t) => PERSONS.map((p) => `${p}_${t}`))];
    const bad = entries.flatMap(([id, e]) => keys.filter((k) => !e[k]).map((k) => `${id}.${k}`));
    expect(bad).toEqual([]);
  });

  test('stores every cell of every aspect, and a whole perfective with every pf_base', () => {
    const missing = entries.flatMap(([id, e]) => CELLS.filter((k) => !e[k]).map((k) => `${id}.${k}`));
    expect(missing).toEqual([]);
    const pf = entries.filter(([, e]) => e['pf_base']).flatMap(([id, e]) => CELLS.filter((k) => !e[`pf_${k}`]).map((k) => `${id}.pf_${k}`));
    expect(pf).toEqual([]);
    const stray = entries.filter(([, e]) => !e['pf_base'] && Object.keys(e).some((k) => k.startsWith('pf_'))).map(([id]) => id);
    expect(stray).toEqual([]);
  });

  test('keeps the 3rd person one form for both numbers', () => {
    const bad = entries.flatMap(([id, e]) =>
      TENSES.flatMap((t) => ['', 'pf_'].filter((p) => e[`${p}base`] && e[`${p}3sg_${t}`] !== e[`${p}3pl_${t}`]).map((p) => `${id}.${p}${t}`)),
    );
    expect(bad).toEqual([]);
  });

  test('stores one word per cell, no stress marks', () => {
    const bad = entries.flatMap(([id, e]) =>
      CELLS.flatMap((k) => [k, `pf_${k}`]).filter((k) => e[k] !== undefined && !/^[a-ząčęėįšųūž]+$/.test(e[k]!)).map((k) => `${id}.${k}=${e[k]}`),
    );
    expect(bad).toEqual([]);
  });

  test('writes the suffix reflexive without -si, keeping -tis on the infinitive', () => {
    expect(LT_VERBS_A['EXPECT']).toMatchObject({ base: 'tikėtis', '1sg_present': 'tikiu', '3sg_past': 'tikėjo', reflexive: '1', object_case: 'gen' });
    const reflexive = entries.filter(([, e]) => e['reflexive'] === '1').map(([id]) => id);
    expect(reflexive).toEqual(['EXPECT']);
    // a prefix reflexive carries its -si- inside and no flag
    expect(LT_VERBS_A['REMEMBER']).toMatchObject({ base: 'atsiminti', '3sg_present': 'atsimena' });
    expect(LT_VERBS_A['CHOOSE']!['reflexive']).toBeUndefined();
  });

  test('leaves the stative and modal-like verbs unpaired', () => {
    for (const id of ['LOVE', 'DESIRE', 'KNOW', 'KNOW_ACQUAINTED', 'REMEMBER', 'EXPECT', 'OWN', 'HOLD', 'HOLD_GRASP', 'INCLUDE', 'NEED', 'HAVE', 'DEPEND']) {
      expect(LT_VERBS_A[id]!['pf_base'], id).toBeUndefined();
    }
  });

  test('carries the government and meaning flags', () => {
    expect(LT_VERBS_A['KNOW']).toMatchObject({ content_clause_force: 'either', object_sense: 'KNOW_ACQUAINTED' });
    expect(LT_VERBS_A['CAUSE_VERB']!['causative']).toBe('1');
    expect(LT_VERBS_A['DESIRE']!['object_case']).toBe('gen');
    expect(LT_VERBS_A['NEED']).toMatchObject({ experiencer: '1', object_case: 'gen' });
    expect(LT_VERBS_A['PLAY_INSTRUMENT']!['object_case']).toBe('ins');
    expect(LT_VERBS_A['LOOK_AT']).toMatchObject({ object_prep: 'į', object_prep_case: 'acc' });
    expect(LT_VERBS_A['DEPEND']).toMatchObject({ object_prep: 'nuo', object_prep_case: 'gen' });
    expect(LT_VERBS_A['ADD']).toMatchObject({ terminus_prep: 'prie', terminus_prep_case: 'gen' });
    expect(LT_VERBS_A['LINK']).toMatchObject({ terminus_prep: 'su', terminus_prep_case: 'ins' });
    expect(LT_VERBS_A['TRANSFORM']!['object_predicative_case']).toBe('ins');
    // Polish's genitive objects of TRY and USE are Lithuanian accusatives
    expect(LT_VERBS_A['TRY']!['object_case']).toBeUndefined();
    expect(LT_VERBS_A['USE']!['object_case']).toBeUndefined();
  });

  test.each([
    // irregular and nasal presents
    ['KNOW_ACQUAINTED', '1sg_present', 'pažįstu'], ['BUY', 'pf_2sg_present', 'nuperki'], ['BITE', '1sg_present', 'kandu'],
    ['UNDERSTAND', '2sg_present', 'supranti'], ['DRAG', '3sg_present', 'velka'], ['CRY_OUT', 'pf_1sg_present', 'sušunku'],
    ['FEEL', 'pf_1sg_present', 'pajuntu'], ['LEAVE_BEHIND', '1sg_present', 'palieku'], ['TYPE', '1pl_present', 'renkame'],
    // primary verbs: t / d back in the 2sg of a č / dž present
    ['CHANGE', '2sg_present', 'keiti'], ['PRESS', '2sg_present', 'spaudi'], ['TRANSLATE', 'pf_2sg_present', 'išverti'],
    ['SPEND_MONEY', '2sg_present', 'išleidi'], ['EXPAND', '2sg_present', 'pleti'],
    // primary verbs: the hard -usi participle after an -ė past; -yti verbs keep -iusi
    ['TAKE', 'pf_past_active_fem', 'paėmusi'], ['DRINK', 'pf_past_active_fem', 'išgėrusi'], ['CHANGE', 'pf_past_active_fem', 'pakeitusi'],
    ['LEAD', 'past_active_fem_plural', 'vedusios'], ['DELETE', 'pf_past_active_fem', 'ištrynusi'], ['SEE', 'past_active_fem', 'mačiusi'],
    ['EAT', 'pf_past_active_fem', 'suvalgiusi'],
    // pasts, softened
    ['TAKE', '1sg_past', 'ėmiau'], ['READ', 'pf_1sg_past', 'perskaičiau'], ['LEAD', '1sg_past', 'vedžiau'], ['CUT', '1sg_past', 'pjoviau'],
    // futures: sibilant stems, and the prefixed one-syllable root (override)
    ['DESIRE', '3sg_future', 'trokš'], ['LEAD', '1sg_future', 'vesiu'], ['UNDERSTAND', '3sg_future', 'supras'], ['ACQUIRE', '3sg_future', 'įgis'],
    ['ACQUIRE', '1sg_future', 'įgysiu'],
    // imperatives dropping a stem-final g / k
    ['SET_ON_FIRE', 'pf_2sg_imperative', 'padek'], ['TURN_OFF', '2sg_imperative', 'išjunk'], ['BUY', '2sg_imperative', 'pirk'],
    // participles
    ['GET', 'past_active', 'gavęs'], ['LOSE', 'passive', 'prarastas'], ['HAVE', 'adverbial', 'turėdamas'], ['EAT_ANIMAL', 'past_active_fem', 'ėdusi'],
  ])('%s.%s is %s', (id, key, form) => {
    expect(LT_VERBS_A[id]![key]).toBe(form);
  });

  test('builds a whole primary paradigm right', () => {
    const pick = (id: string, keys: string[]) => keys.map((k) => LT_VERBS_A[id]![k]).join(' ');
    expect(pick('CHANGE', PERSONS.map((p) => `${p}_present`)))
      .toBe('keičiu keiti keičia keičiame keičiate keičia');
    expect(pick('CHANGE', PERSONS.map((p) => `pf_${p}_past`)))
      .toBe('pakeičiau pakeitei pakeitė pakeitėme pakeitėte pakeitė');
    expect(pick('CHANGE', ['pf_1sg_future', 'pf_3sg_future', 'pf_2sg_imperative', 'pf_past_active', 'pf_past_active_fem', 'pf_passive', 'pf_1sg_conditional']))
      .toBe('pakeisiu pakeis pakeisk pakeitęs pakeitusi pakeistas pakeisčiau');
  });
});
