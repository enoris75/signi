import { describe, expect, test } from 'vitest';
import {
  ADINA, CHAUN, EL, ELLA, GIAT, INS, IR, JAU, MAI, MANGIAR, MIEUR, PLI, PUDAIR, SA_TSCHENTAR, STANCHEL, STUAIR, VEGNIR, VESAIR, VULAIR,
  complement, complements, concept, el, modal, np, vp,
} from './rumgr.fixtures.js';
import { predicateText } from './predicateText.js';

const mouse = el(np(MIEUR));
const CATS = { ...GIAT, number: 'plural' };

describe('predicateText', () => {
  test('the present agrees with the subject', () => {
    expect(predicateText(GIAT, vp(MANGIAR), mouse)).toBe('mangia la mieur');
    expect(predicateText(JAU, vp(MANGIAR))).toBe('mangel');
    expect(predicateText(CATS, vp(MANGIAR))).toBe('mangian');
    expect(predicateText(INS, vp(MANGIAR), mouse)).toBe('mangia la mieur');
  });

  test('the compound past and the future', () => {
    expect(predicateText(GIAT, vp(MANGIAR, { tense: 'past' }), mouse)).toBe('ha mangià la mieur');
    expect(predicateText(ELLA, vp(IR, { tense: 'past' }))).toBe('è ida');
    expect(predicateText(GIAT, vp(MANGIAR, { tense: 'future' }), mouse)).toBe('vegn a mangiar la mieur');
  });

  test('na … betg around the finite word', () => {
    expect(predicateText(GIAT, vp(MANGIAR, { negative: true }), mouse)).toBe('na mangia betg la mieur');
    expect(predicateText(GIAT, vp(MANGIAR, { negative: true, tense: 'past' }), mouse)).toBe("n'ha betg mangià la mieur");
    expect(predicateText(GIAT, vp(MANGIAR, { negative: true, tense: 'future' }))).toBe('na vegn betg a mangiar');
  });

  test('mai replaces betg, pli follows it, a frequency adverb follows the finite verb', () => {
    expect(predicateText(GIAT, vp(MANGIAR, { modifier: concept(MAI, 'NEVER') }))).toBe('na mangia mai');
    expect(predicateText(GIAT, vp(MANGIAR, { modifier: concept(PLI, 'NO_LONGER') }))).toBe('na mangia betg pli');
    expect(predicateText(GIAT, vp(MANGIAR, { modifier: concept(ADINA), tense: 'past' }), mouse)).toBe('ha adina mangià la mieur');
  });

  test('negative concord: a nagin object keeps na and drops betg', () => {
    expect(predicateText(JAU, vp(VESAIR, { negative: true }), el(np(CHAUN, { definiteness: 'no' })))).toBe('na ves nagin chaun');
  });

  test('a negative subject takes na alone', () => {
    expect(predicateText({ ...GIAT, definiteness: 'no' }, vp(MANGIAR))).toBe('na mangia');
  });

  test('an object pronoun is its tonic form after the verb', () => {
    expect(predicateText(JAU, vp(VESAIR), el(np(EL)))).toBe('ves el');
  });

  test('modals: the outer one finite, the inner ones infinitives', () => {
    expect(predicateText(EL, vp(IR, { modals: [modal(VULAIR), modal(PUDAIR)] }))).toBe('vul pudair ir');
    expect(predicateText(EL, vp(IR, { modals: [modal(STUAIR)], negative: true }))).toBe('na sto betg ir');
    expect(predicateText(EL, vp(IR, { modals: [modal(VULAIR)], governedNegative: true }))).toBe('vul betg ir');
  });

  test('a reflexive verb: the clitic before the lexical verb', () => {
    expect(predicateText(JAU, vp(SA_TSCHENTAR))).toBe('ma tschent');
    expect(predicateText(JAU, vp(SA_TSCHENTAR, { negative: true }))).toBe('na ma tschent betg');
    expect(predicateText(ELLA, vp(SA_TSCHENTAR, { tense: 'past' }))).toBe('è sa tschentada');
  });

  test('the passive on vegnir, its participle agreeing with the patient', () => {
    const passive = vp(MANGIAR, { voice: 'passive', passiveAux: concept(VEGNIR, 'COME') });
    expect(predicateText(MIEUR, passive, undefined, undefined, el(np(GIAT)))).toBe('vegn mangiada dal giat');
  });

  test('the predicate adjective agrees with the subject', () => {
    const BE = { base: 'esser', copula: '1', '3sg_present': 'è' };
    expect(predicateText(ELLA, vp(BE), undefined, complements({ predicative: complement(np(STANCHEL, { role: 'adjective' })) }))).toBe('è stancla');
  });

  test('the infinitive: betg alone', () => {
    expect(predicateText(INS, vp(MANGIAR, { mood: 'infinitive', negative: true }), mouse)).toBe('betg mangiar la mieur');
  });
});
