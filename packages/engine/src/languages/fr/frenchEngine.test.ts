import type { CoordConjunction } from '@signi/shared';
import { describe, expect, test } from 'vitest';
import {
  AILE, ANGE, CHAT, CHIEN, clause, concept, EAU, el, type Forms, HOMME, IL, MAISON, MANGER, MOT, NEGATIF, NOURRITURE, np, ON,
  PREMIER, SOURIS, TU, UNIVERSEL, vp,
} from './fr.fixtures.js';
import { frenchEngine } from './frenchEngine.js';

const COURIR: Forms = { base: 'courir', '2sg_present': 'cours', '3sg_present': 'court', '1sg_future': 'courrai' };

const catEats = clause(np(CHAT), vp(MANGER));
const dogRuns = clause(np(CHIEN), vp(COURIR));
const joined = (conjunction: CoordConjunction) => frenchEngine.render({ ...catEats, coordination: { conjunction, clause: dogRuns } });
// Both are optional on LanguageEngine; the French engine implements them.
const word = (forms: Forms) => frenchEngine.renderWord?.(concept(forms));
const menuDeterminer = (forms: Forms) => frenchEngine.renderDeterminer?.(concept(forms));

describe('frenchEngine', () => {
  test('is the French engine', () => {
    expect(frenchEngine.language).toBe('fr');
  });

  test('renders a plain clause, leaving the full stop to the translator', () => {
    expect(frenchEngine.render(clause(np(CHAT), vp(MANGER), { directObject: el(np(SOURIS)) }))).toBe('le chat mange la souris');
  });

  test('a conditional leads with the si clause in the imparfait', () => {
    const hypothetical = (condition: Forms) =>
      frenchEngine.render(clause(np(CHIEN), vp(COURIR, { mood: 'conditional' }), { condition: clause(np(condition), vp(MANGER, { mood: 'subjunctive' })) }));
    expect(hypothetical(CHAT)).toBe('si le chat mangeait, le chien courrait');
    expect(hypothetical(ON)).toBe('si on mangeait, le chien courrait');
    expect(hypothetical({ ...IL, gender: 'fem', base: 'elle' })).toBe('si elle mangeait, le chien courrait');
  });

  test('si elides only before il and ils', () => {
    const hypothetical = (condition: Forms) =>
      frenchEngine.render(clause(np(CHIEN), vp(COURIR, { mood: 'conditional' }), { condition: clause(np(condition), vp(MANGER, { mood: 'subjunctive' })) }));
    expect(hypothetical(IL)).toBe("s'il mangeait, le chien courrait");
    expect(hypothetical({ ...IL, number: 'plural' })).toBe("s'ils mangeaient, le chien courrait");
  });

  test('a coordinated clause follows a comma and its conjunction', () => {
    expect(joined('and')).toBe('le chat mange, et le chien court');
    expect(joined('or')).toBe('le chat mange, ou le chien court');
    expect(joined('but')).toBe('le chat mange, mais le chien court');
    expect(joined('that_is')).toBe("le chat mange, c'est-à-dire le chien court");
    expect(joined('therefore')).toBe('le chat mange, donc le chien court');
    expect(joined('then')).toBe('le chat mange, et puis le chien court');
  });

  test('coordinated commands both stay subjectless', () => {
    const eat = clause(np(TU), vp(MANGER, { mood: 'imperative' }), { directObject: el(np(NOURRITURE)) });
    const run = clause(np(TU), vp(COURIR, { mood: 'imperative' }));
    expect(frenchEngine.render({ ...eat, coordination: { conjunction: 'and', clause: run } })).toBe('mange la nourriture, et cours');
  });

  test('renderWord gives a noun its base and agrees an adjective', () => {
    expect(word(MAISON)).toBe('maison');
    expect(word(NEGATIF)).toBe('négatif');
    expect(word({ ...PREMIER, gender: 'fem' })).toBe('première');
    expect(word({ ...UNIVERSEL, gender: 'fem', number: 'plural' })).toBe('universelles');
  });

  test('renderDeterminer elides against the citation noun', () => {
    expect(menuDeterminer(MOT)).toBe('le');
    expect(menuDeterminer(AILE)).toBe("l'");
    expect(menuDeterminer(HOMME)).toBe("l'");
    expect(menuDeterminer({ ...ANGE, definiteness: 'this' })).toBe('cet');
    expect(menuDeterminer({ ...MAISON, definiteness: 'that' })).toBe('cette');
    expect(menuDeterminer({ ...ANGE, definiteness: 'many', number: 'plural' })).toBe("beaucoup d'");
    expect(menuDeterminer({ ...EAU, definiteness: 'some' })).toBe("de l'");
  });

  test('renderDeterminer names every other determiner', () => {
    expect(menuDeterminer({ ...MAISON, definiteness: 'indefinite' })).toBe('une');
    expect(menuDeterminer({ ...MOT, definiteness: 'some', number: 'plural' })).toBe('quelques');
    expect(menuDeterminer({ ...MOT, definiteness: 'few', number: 'plural' })).toBe('peu de');
    expect(menuDeterminer({ ...MAISON, definiteness: 'all', number: 'plural' })).toBe('toutes les');
    expect(menuDeterminer({ ...MOT, definiteness: 'no' })).toBe('aucun');
    expect(menuDeterminer({ ...MOT, definiteness: 'bare' })).toBe('');
  });

  test('renderDeterminer reads plurality off number, falling back to count', () => {
    expect(menuDeterminer({ ...MOT, number: 'plural' })).toBe('les');
    expect(menuDeterminer({ ...MOT, count: 'plural' })).toBe('les');
    expect(menuDeterminer({ ...MOT, count: 'plural', number: 'singular' })).toBe('le');
    expect(menuDeterminer({ ...MOT, number: 'plural', definiteness: 'indefinite' })).toBe('des');
  });
});
