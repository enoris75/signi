import type { CoordConjunction } from '@signi/shared';
import { describe, expect, test } from 'vitest';
import {
  AFRICA, AGUA, BOM, CAO, CASA, clause, COMER, concept, el, EU, type Forms, GATO, LIVRO, np, PRIMEIRO, RATO, VOCE, vp,
} from './pt.fixtures.js';
import { portugueseEngine } from './portugueseEngine.js';

const CORRER: Forms = { base: 'correr', '1sg_present': 'corro', '3sg_present': 'corre', '1sg_future': 'correrei', '3pl_past': 'correram' };

const catEats = clause(np(GATO), vp(COMER));
const dogRuns = clause(np(CAO), vp(CORRER));
const joined = (conjunction: CoordConjunction) => portugueseEngine.render({ ...catEats, coordination: { conjunction, clause: dogRuns } });
// `renderWord` and `renderDeterminer` are optional on LanguageEngine; the Portuguese engine implements both.
const word = (forms: Forms, conceptId?: string) => portugueseEngine.renderWord?.(concept(forms, conceptId));
const menuDeterminer = (forms: Forms) => portugueseEngine.renderDeterminer?.(concept(forms));

describe('portugueseEngine', () => {
  test('is the Portuguese engine', () => {
    expect(portugueseEngine.language).toBe('pt');
  });

  test('renders a plain clause, leaving the full stop to the translator', () => {
    expect(portugueseEngine.render(clause(np(GATO), vp(COMER), { directObject: el(np(RATO)) }))).toBe('o gato come o rato');
  });

  test('a conditional leads with the "se" clause in the subjunctive', () => {
    const phrase = clause(np(CAO), vp(CORRER, { mood: 'conditional' }), { condition: clause(np(GATO), vp(COMER, { mood: 'subjunctive' })) });
    expect(portugueseEngine.render(phrase)).toBe('se o gato comesse, o cão correria');
  });

  test('both clauses of a conditional drop a pronoun subject', () => {
    const phrase = clause(np(EU), vp(COMER, { mood: 'conditional' }), { condition: clause(np(EU), vp(CORRER, { mood: 'subjunctive' })) });
    expect(portugueseEngine.render(phrase)).toBe('se corresse, comeria');
  });

  test('a coordinated clause follows a comma and its conjunction', () => {
    expect(joined('and')).toBe('o gato come, e o cão corre');
    expect(joined('or')).toBe('o gato come, ou o cão corre');
    expect(joined('but')).toBe('o gato come, mas o cão corre');
    expect(joined('that_is')).toBe('o gato come, isto é, o cão corre'); // explanatory: a comma after it too
    expect(joined('therefore')).toBe('o gato come, portanto o cão corre');
    expect(joined('then')).toBe('o gato come, e depois o cão corre');
  });

  test('coordinated commands both stay subjectless', () => {
    const eat = clause(np(VOCE), vp(COMER, { mood: 'imperative' }, 'EAT'), { directObject: el(np(RATO)) });
    const run = clause(np(VOCE), vp(CORRER, { mood: 'imperative' }, 'RUN'));
    expect(portugueseEngine.render({ ...eat, coordination: { conjunction: 'then', clause: run } })).toBe('coma o rato, e depois corra');
  });

  test('renderWord agrees an adjective with the gender and number on its forms', () => {
    expect(word(PRIMEIRO, 'FIRST')).toBe('primeiro');
    expect(word({ ...PRIMEIRO, gender: 'fem' }, 'FIRST')).toBe('primeira');
    expect(word({ ...PRIMEIRO, gender: 'fem', number: 'plural' }, 'FIRST')).toBe('primeiras');
    expect(word({ ...BOM, gender: 'fem' }, 'GOOD')).toBe('boa');
  });

  test('renderWord gives any other word its citation form', () => {
    expect(word({ ...LIVRO, number: 'plural' })).toBe('livro');
  });

  test('renderDeterminer names the determiner a noun would take', () => {
    expect(menuDeterminer(GATO)).toBe('o');
    expect(menuDeterminer({ ...CASA, definiteness: 'indefinite' })).toBe('uma');
    expect(menuDeterminer({ ...GATO, definiteness: 'that' })).toBe('esse');
    expect(menuDeterminer({ ...GATO, definiteness: 'all' })).toBe('todos os');
    expect(menuDeterminer({ ...CASA, definiteness: 'no' })).toBe('nenhuma');
    expect(menuDeterminer({ ...AGUA, definiteness: 'some' })).toBe('um pouco de');
    expect(menuDeterminer({ ...AFRICA, definiteness: 'bare' })).toBe('a');
    expect(menuDeterminer({ ...GATO, definiteness: 'bare' })).toBe('');
  });

  test('renderDeterminer reads plurality off number, falling back to count', () => {
    expect(menuDeterminer({ ...LIVRO, number: 'plural' })).toBe('os');
    expect(menuDeterminer({ ...CASA, count: 'plural', definiteness: 'indefinite' })).toBe('umas');
    expect(menuDeterminer({ ...LIVRO, count: 'plural', number: 'singular' })).toBe('o');
  });
});
