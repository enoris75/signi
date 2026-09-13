import type { CoordConjunction } from '@signi/shared';
import { describe, expect, test } from 'vitest';
import {
  ACQUA, AFRICA, ALA, CANE, CASA, CIBO, clause, concept, CORRERE, el, FELICE, type Forms, GATTO, LIBRO, MANGIARE, np, PRIMO, SLOT,
  TOPO, TU, UOMO, vp,
} from './it.fixtures.js';
import { italianEngine } from './italianEngine.js';

const SALTARE: Forms = { base: 'saltare', '3sg_present': 'salta', '2sg_present': 'salti' };

const catRuns = clause(np(GATTO), vp(CORRERE));
const dogJumps = clause(np(CANE), vp(SALTARE));
const joined = (conjunction: CoordConjunction) => italianEngine.render({ ...catRuns, coordination: { conjunction, clause: dogJumps } });
// `renderWord` and `renderDeterminer` are optional on LanguageEngine; the Italian engine implements both.
const word = (forms: Forms) => italianEngine.renderWord?.(concept(forms));
const menuDeterminer = (forms: Forms) => italianEngine.renderDeterminer?.(concept(forms));

describe('italianEngine', () => {
  test('is the Italian engine', () => {
    expect(italianEngine.language).toBe('it');
  });

  test('renders a plain clause, leaving the full stop to the translator', () => {
    expect(italianEngine.render(clause(np(GATTO), vp(MANGIARE), { directObject: el(np(TOPO)) }))).toBe('il gatto mangia il topo');
  });

  test('a condition leads as a se clause in the subjunctive', () => {
    const phrase = clause(np(CANE), vp(CORRERE, { mood: 'conditional' }), {
      condition: clause(np(GATTO), vp(MANGIARE, { mood: 'subjunctive' }), { directObject: el(np(LIBRO)) }),
    });
    expect(italianEngine.render(phrase)).toBe('se il gatto mangiasse il libro, il cane correrebbe');
  });

  test('a coordinated clause follows a comma and its conjunction', () => {
    expect(joined('and')).toBe('il gatto corre, e il cane salta');
    expect(joined('or')).toBe('il gatto corre, o il cane salta');
    expect(joined('but')).toBe('il gatto corre, ma il cane salta');
    expect(joined('that_is')).toBe('il gatto corre, cioè il cane salta');
    expect(joined('therefore')).toBe('il gatto corre, quindi il cane salta');
    expect(joined('then')).toBe('il gatto corre, e poi il cane salta');
  });

  test('coordinated commands both stay subjectless', () => {
    const eat = clause(np(TU), vp(MANGIARE, { mood: 'imperative' }, 'EAT'), { directObject: el(np(CIBO)) });
    const run = clause(np(TU), vp(CORRERE, { mood: 'imperative' }, 'RUN'));
    expect(italianEngine.render({ ...eat, coordination: { conjunction: 'then', clause: run } })).toBe('mangia il cibo, e poi corri');
  });

  test('renderWord gives a noun its citation form', () => {
    expect(word(GATTO)).toBe('gatto');
  });

  test('renderWord agrees an adjective with the gender and number on its forms', () => {
    expect(word(PRIMO)).toBe('primo');
    expect(word({ ...PRIMO, gender: 'fem' })).toBe('prima');
    expect(word({ ...PRIMO, gender: 'fem', number: 'plural' })).toBe('prime');
    expect(word({ ...FELICE, number: 'plural' })).toBe('felici');
  });

  test('renderDeterminer elides and agrees against the citation noun', () => {
    expect(menuDeterminer(GATTO)).toBe('il');
    expect(menuDeterminer(UOMO)).toBe("l'");
    expect(menuDeterminer(SLOT)).toBe('lo');
    expect(menuDeterminer(CASA)).toBe('la');
    expect(menuDeterminer({ ...ALA, definiteness: 'indefinite' })).toBe("un'");
    expect(menuDeterminer({ ...UOMO, definiteness: 'this' })).toBe("quest'");
    expect(menuDeterminer({ ...GATTO, definiteness: 'that' })).toBe('quel');
    expect(menuDeterminer({ ...GATTO, definiteness: 'no' })).toBe('nessun');
    expect(menuDeterminer({ ...GATTO, definiteness: 'bare' })).toBe('');
    expect(menuDeterminer({ ...ACQUA, definiteness: 'some' })).toBe("dell'");
    expect(menuDeterminer({ ...AFRICA, definiteness: 'indefinite' })).toBe("l'");
  });

  test('renderDeterminer reads plurality off number, falling back to count', () => {
    expect(menuDeterminer({ ...GATTO, number: 'plural' })).toBe('i');
    expect(menuDeterminer({ ...GATTO, count: 'plural' })).toBe('i');
    expect(menuDeterminer({ ...GATTO, count: 'plural', number: 'singular' })).toBe('il');
    expect(menuDeterminer({ ...UOMO, number: 'plural', definiteness: 'all' })).toBe('tutti gli');
    expect(menuDeterminer({ ...GATTO, number: 'plural', definiteness: 'indefinite' })).toBe('');
  });
});
