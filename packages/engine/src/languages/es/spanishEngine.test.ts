import type { CoordConjunction } from '@signi/shared';
import { describe, expect, test } from 'vitest';
import {
  AGUA, ANTARTIDA, CANSADO, CASA, clause, COMER, COMIDA, concept, CORRER, DINERO, el, EUROPA, type Forms, FELIZ, GATO, np, PERRO,
  PRIMERO, RAPIDO_ADV, TU, vp,
} from './es.fixtures.js';
import { spanishEngine } from './spanishEngine.js';

const catEats = clause(np(GATO), vp(COMER));
const dogRuns = clause(np(PERRO), vp(CORRER));
const joined = (conjunction: CoordConjunction) => spanishEngine.render({ ...catEats, coordination: { conjunction, clause: dogRuns } });
// `renderWord` and `renderDeterminer` are optional on LanguageEngine; the Spanish engine implements both.
const word = (forms: Forms, conceptId?: string) => spanishEngine.renderWord?.(concept(forms, conceptId));
const menuDeterminer = (forms: Forms) => spanishEngine.renderDeterminer?.(concept(forms));

describe('spanishEngine', () => {
  test('is the Spanish engine', () => {
    expect(spanishEngine.language).toBe('es');
  });

  test('renders a plain clause, leaving the full stop to the translator', () => {
    expect(spanishEngine.render(clause(np(GATO), vp(COMER), { directObject: el(np(COMIDA)) }))).toBe('el gato come la comida');
  });

  test('a conditional leads with the si clause', () => {
    const phrase = clause(np(PERRO), vp(CORRER, { mood: 'conditional' }), {
      condition: clause(np(GATO), vp(COMER, { mood: 'subjunctive' }), { directObject: el(np(COMIDA)) }),
    });
    expect(spanishEngine.render(phrase)).toBe('si el gato comiera la comida, el perro correría');
  });

  test('a coordinated clause follows a comma and its conjunction', () => {
    expect(joined('and')).toBe('el gato come, y el perro corre');
    expect(joined('or')).toBe('el gato come, o el perro corre');
    expect(joined('but')).toBe('el gato come, pero el perro corre');
    expect(joined('then')).toBe('el gato come, y luego el perro corre');
  });

  test('coordinated commands both stay subjectless', () => {
    const eat = clause(np(TU), vp(COMER, { mood: 'imperative' }, 'EAT'), { directObject: el(np(COMIDA)) });
    const run = clause(np(TU), vp(CORRER, { mood: 'imperative', modifier: concept(RAPIDO_ADV) }, 'RUN'));
    expect(spanishEngine.render({ ...eat, coordination: { conjunction: 'and', clause: run } })).toBe('come la comida, y corre rápido');
  });

  test('renderWord gives a noun or adverb its citation form', () => {
    expect(word(GATO)).toBe('gato');
    expect(word(RAPIDO_ADV)).toBe('rápido');
  });

  // With no noun behind it, the ordinal keeps its -o: "primero", never "primer".
  test('renderWord agrees an adjective with the gender and number it was given', () => {
    expect(word(PRIMERO, 'FIRST')).toBe('primero');
    expect(word({ ...PRIMERO, gender: 'fem' }, 'FIRST')).toBe('primera');
    expect(word({ ...PRIMERO, number: 'plural' }, 'FIRST')).toBe('primeros');
    expect(word({ ...CANSADO, gender: 'fem', number: 'plural' })).toBe('cansadas');
    expect(word({ ...FELIZ, number: 'plural' })).toBe('felices');
  });

  test('renderDeterminer names the determiner the noun would take', () => {
    expect(menuDeterminer(GATO)).toBe('el');
    expect(menuDeterminer({ ...CASA, definiteness: 'indefinite' })).toBe('una');
    expect(menuDeterminer({ ...CASA, definiteness: 'this' })).toBe('esta');
    expect(menuDeterminer({ ...GATO, definiteness: 'no' })).toBe('ningún');
    expect(menuDeterminer({ ...CASA, number: 'plural', definiteness: 'all' })).toBe('todas las');
    expect(menuDeterminer({ ...DINERO, definiteness: 'some' })).toBe('algo de');
    expect(menuDeterminer(AGUA)).toBe('el');
  });

  test('renderDeterminer reads plurality off number, falling back to count', () => {
    expect(menuDeterminer({ ...GATO, number: 'plural' })).toBe('los');
    expect(menuDeterminer({ ...GATO, count: 'plural' })).toBe('los');
    expect(menuDeterminer({ ...GATO, count: 'plural', number: 'singular' })).toBe('el');
    expect(menuDeterminer({ ...GATO, number: 'plural', definiteness: 'indefinite' })).toBe('unos');
  });

  test('renderDeterminer is empty for a bare proper name', () => {
    expect(menuDeterminer(EUROPA)).toBe('');
    expect(menuDeterminer(ANTARTIDA)).toBe('la');
  });
});
