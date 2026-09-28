import { describe, expect, test } from 'vitest';
import { concepts } from '../index.js';
import { PL_VERBS_A } from './verbs-a.js';

// P05-E5: the Polish verbs, part A. Every form is (verify) until the native review (P05-E11); this
// pins the shape the engine reads (style-pl.md § Verbs) and a sample of the forms the local class
// helpers generate, so a helper change cannot silently break an irregular or regular class.
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
const PAST = ['past_masc', 'past_fem', 'past_neut', 'past_virile', 'past_nonvirile'];
const entries = Object.entries(PL_VERBS_A);

describe('the Polish verbs, part A (P05-E5)', () => {
  test('covers all 103 verbs of the lane', () => {
    expect(IDS).toHaveLength(103);
    expect(IDS.filter((id) => !PL_VERBS_A[id])).toEqual([]);
  });

  test('holds only verb concepts', () => {
    const bad = Object.keys(PL_VERBS_A).filter((id) => concepts.find((c) => c.id === id)?.role !== 'verb');
    expect(bad).toEqual([]);
  });

  test('stores the base, the six presents and the five past forms of every verb', () => {
    const keys = ['base', ...PERSONS.map((p) => `${p}_present`), ...PAST];
    const bad = entries.flatMap(([id, e]) => keys.filter((k) => !e[k]).map((k) => `${id}.${k}`));
    expect(bad).toEqual([]);
  });

  test('stores the whole perfective future and past with every pf_base', () => {
    const keys = [...PERSONS.map((p) => `pf_${p}_future`), ...PAST.map((k) => `pf_${k}`)];
    const bad = entries.filter(([, e]) => e['pf_base']).flatMap(([id, e]) => keys.filter((k) => !e[k]).map((k) => `${id}.${k}`));
    expect(bad).toEqual([]);
    // and no stray pf_ key on an unpaired verb, nor a perfective adverbial
    const stray = entries.filter(([, e]) => !e['pf_base'] && Object.keys(e).some((k) => k.startsWith('pf_'))).map(([id]) => id);
    expect(stray).toEqual([]);
    expect(entries.filter(([, e]) => e['pf_adverbial']).map(([id]) => id)).toEqual([]);
  });

  test('keeps się only on the infinitives of a reflexive verb', () => {
    const bad = entries.flatMap(([id, e]) =>
      Object.entries(e)
        .filter(([k, val]) => /\bsię\b/.test(val) && !(e['reflexive'] === '1' && (k === 'base' || k === 'pf_base')))
        .map(([k]) => `${id}.${k}`),
    );
    expect(bad).toEqual([]);
    expect(PL_VERBS_A['EXPECT']!['base']).toBe('spodziewać się');
  });

  test('leaves the stative and modal-like verbs unpaired', () => {
    for (const id of ['LOVE', 'KNOW', 'KNOW_ACQUAINTED', 'HAVE', 'NEED', 'DEPEND', 'CANCEL']) {
      expect(PL_VERBS_A[id]!['pf_base'], id).toBeUndefined();
    }
  });

  test.each([
    ['EAT', 'past_virile', 'jedli'], ['EAT', 'pf_past_virile', 'zjedli'], ['EAT', 'pf_passive', 'zjedzony'],
    ['EAT', '3pl_present', 'jedzą'], ['EAT', '2sg_imperative', 'jedz'],
    ['TAKE', 'pf_past_fem', 'wzięła'], ['TAKE', 'pf_2sg_imperative', 'weź'], ['TAKE', 'pf_3pl_future', 'wezmą'],
    ['BRING', 'pf_past_masc', 'przyniósł'], ['BRING', 'pf_past_stem_masc', 'przyniosł'], ['BRING', 'pf_past_virile', 'przynieśli'],
    ['SEE', 'past_virile', 'widzieli'], ['SEE', 'pf_base', 'zobaczyć'], ['SEE', 'passive_virile', 'widziani'],
    ['MAKE', 'pf_2sg_imperative', 'zrób'], ['MAKE', 'pf_passive_virile', 'zrobieni'],
    ['HAVE', 'past_virile', 'mieli'], ['HAVE', 'adverbial', 'mając'], ['HAVE', '2sg_imperative', 'miej'],
    ['KNOW', '3pl_present', 'wiedzą'], ['BITE', 'past_virile', 'gryźli'], ['CUT', '1sg_present', 'tnę'],
    ['PUT', 'pf_2sg_imperative', 'połóż'], ['PRESS', 'pf_2sg_future', 'naciśniesz'],
    ['START', 'pf_past_masc', 'zaczął'], ['OPEN', 'pf_passive', 'otwarty'], ['ADD', 'pf_3pl_future', 'dodadzą'],
    ['REMOVE', 'pf_2sg_imperative', 'usuń'], ['EXTINGUISH', '1sg_present', 'gaszę'], ['CONFINE', '3pl_present', 'więżą'],
  ])('%s.%s is %s', (id, key, form) => {
    expect(PL_VERBS_A[id]![key]).toBe(form);
  });

  // One whole regular paradigm per class helper.
  test('builds the regular classes right', () => {
    const pick = (id: string, keys: string[]) => keys.map((k) => PL_VERBS_A[id]![k]).join(' ');
    const pres = PERSONS.map((p) => `${p}_present`);
    expect(pick('READ', [...pres, ...PAST, '2sg_imperative', 'adverbial', 'passive', 'passive_virile']))
      .toBe('czytam czytasz czyta czytamy czytacie czytają czytał czytała czytało czytali czytały czytaj czytając czytany czytani');
    expect(pick('BUY', [...pres, ...PAST, '2sg_imperative', 'adverbial', 'passive']))
      .toBe('kupuję kupujesz kupuje kupujemy kupujecie kupują kupował kupowała kupowało kupowali kupowały kupuj kupując kupowany');
    expect(pick('SPEND_MONEY', [...pres, 'past_masc', '2sg_imperative', 'adverbial']))
      .toBe('wydaję wydajesz wydaje wydajemy wydajecie wydają wydawał wydawaj wydając');
    expect(pick('CLOSE', PERSONS.map((p) => `pf_${p}_future`).concat(PAST.map((k) => `pf_${k}`), ['pf_2sg_imperative', 'pf_passive_virile'])))
      .toBe('zamknę zamkniesz zamknie zamkniemy zamkniecie zamkną zamknął zamknęła zamknęło zamknęli zamknęły zamknij zamknięci');
    expect(pick('CRY_OUT', [...pres, 'past_masc', 'past_virile', '2sg_imperative']))
      .toBe('krzyczę krzyczysz krzyczy krzyczymy krzyczycie krzyczą krzyczał krzyczeli krzycz');
    expect(pick('LOSE', ['pf_base', 'pf_1sg_future', 'pf_past_virile', 'pf_2pl_imperative', 'pf_passive_virile']))
      .toBe('stracić stracę stracili straćcie straceni');
  });
});
