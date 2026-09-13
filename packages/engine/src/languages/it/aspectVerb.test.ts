import { describe, expect, test } from 'vitest';
import { aspectVerb } from './aspectVerb.js';
import { ANDARE, GATTA, GATTO, IO, MANGIARE, NOI, VEDERE } from './it.fixtures.js';

const VOI = { person: '2', number: 'plural' };

describe('aspectVerb', () => {
  test('progressive is stare + gerundio, with stare in the imperfect for the past', () => {
    expect(aspectVerb(MANGIARE, GATTO, 'present', 'progressive')).toBe('sta mangiando');
    expect(aspectVerb(MANGIARE, GATTO, 'past', 'progressive')).toBe('stava mangiando');
    expect(aspectVerb(MANGIARE, GATTO, 'future', 'progressive')).toBe('starà mangiando');
    expect(aspectVerb(MANGIARE, NOI, 'present', 'progressive')).toBe('stiamo mangiando');
  });

  test('prospective is stare per + infinito', () => {
    expect(aspectVerb(MANGIARE, GATTO, 'present', 'prospective')).toBe('sta per mangiare');
    expect(aspectVerb(MANGIARE, GATTO, 'past', 'prospective')).toBe('stava per mangiare');
    expect(aspectVerb(MANGIARE, VOI, 'present', 'prospective')).toBe('state per mangiare');
  });

  test('resultative takes avere by default, its participle unagreed', () => {
    expect(aspectVerb(VEDERE, GATTA, 'present', 'resultative')).toBe('ha visto');
    expect(aspectVerb(VEDERE, GATTO, 'past', 'resultative')).toBe('aveva visto');
    expect(aspectVerb(VEDERE, GATTO, 'future', 'resultative')).toBe('avrà visto');
    expect(aspectVerb(VEDERE, IO, 'present', 'resultative')).toBe('ho visto');
  });

  test('an essere verb takes essere and agrees its participle with the subject', () => {
    expect(aspectVerb(ANDARE, GATTO, 'present', 'resultative')).toBe('è andato');
    expect(aspectVerb(ANDARE, GATTA, 'present', 'resultative')).toBe('è andata');
    expect(aspectVerb(ANDARE, { ...GATTO, number: 'plural' }, 'present', 'resultative')).toBe('sono andati');
    expect(aspectVerb(ANDARE, { ...GATTA, number: 'plural' }, 'past', 'resultative')).toBe('erano andate');
    expect(aspectVerb(ANDARE, IO, 'future', 'resultative')).toBe('sarò andato');
  });

  test('under a hypothetical the auxiliary takes the conditional or imperfect subjunctive', () => {
    expect(aspectVerb(MANGIARE, GATTO, 'present', 'progressive', 'conditional')).toBe('starebbe mangiando');
    expect(aspectVerb(MANGIARE, GATTO, 'present', 'progressive', 'subjunctive')).toBe('stesse mangiando');
    expect(aspectVerb(MANGIARE, GATTO, 'present', 'prospective', 'conditional')).toBe('starebbe per mangiare');
    expect(aspectVerb(MANGIARE, GATTO, 'present', 'resultative', 'conditional')).toBe('avrebbe mangiato');
    expect(aspectVerb(MANGIARE, IO, 'present', 'resultative', 'subjunctive')).toBe('avessi mangiato');
    expect(aspectVerb(ANDARE, GATTA, 'present', 'resultative', 'conditional')).toBe('sarebbe andata');
    expect(aspectVerb(ANDARE, GATTO, 'present', 'resultative', 'subjunctive')).toBe('fosse andato');
  });

  test('the indicative mood keeps the tense form', () => {
    expect(aspectVerb(MANGIARE, GATTO, 'past', 'resultative', 'indicative')).toBe('aveva mangiato');
  });
});
