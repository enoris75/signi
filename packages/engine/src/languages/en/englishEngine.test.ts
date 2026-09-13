import type { CoordConjunction } from '@signi/shared';
import { describe, expect, test } from 'vitest';
import {
  AFRICA, BOOK, BOY, CAT, clause, concept, CRY, DOG, EAT, el, type Forms, MOUSE, np, OBJECT, RUN, vp, WATER, YOU,
} from './en.fixtures.js';
import { englishEngine } from './englishEngine.js';

const catRuns = clause(np(CAT), vp(RUN));
const dogEats = clause(np(DOG), vp(EAT));
const joined = (conjunction: CoordConjunction) => englishEngine.render({ ...catRuns, coordination: { conjunction, clause: dogEats } });
// `renderDeterminer` is optional on LanguageEngine; the English engine implements it.
const menuDeterminer = (forms: Forms) => englishEngine.renderDeterminer?.(concept(forms));

describe('englishEngine', () => {
  test('is the English engine', () => {
    expect(englishEngine.language).toBe('en');
  });

  test('renders a plain clause, leaving the full stop to the translator', () => {
    expect(englishEngine.render(clause(np(CAT), vp(EAT), { directObject: el(np(MOUSE)) }))).toBe('the cat eats the mouse');
  });

  test('a conditional leads with the if clause', () => {
    const phrase = clause(np(DOG), vp(RUN, { mood: 'conditional' }), {
      condition: clause(np(CAT), vp(EAT, { mood: 'subjunctive' }), { directObject: el(np(MOUSE)) }),
    });
    expect(englishEngine.render(phrase)).toBe('if the cat ate the mouse, the dog would run');
  });

  test('a coordinated clause follows a comma and the conjunction’s word', () => {
    expect(joined('and')).toBe('the cat runs, and the dog eats');
    expect(joined('or')).toBe('the cat runs, or the dog eats');
    expect(joined('but')).toBe('the cat runs, but the dog eats');
    expect(joined('that_is')).toBe('the cat runs, that is, the dog eats'); // parenthetical: a comma after it too
    expect(joined('therefore')).toBe('the cat runs, so the dog eats');
    expect(joined('then')).toBe('the cat runs, and then the dog eats');
  });

  test('coordinated commands both stay subjectless', () => {
    const eat = clause(np(YOU), vp(EAT, { mood: 'imperative' }), { directObject: el(np(MOUSE)) });
    const run = clause(np(YOU), vp(RUN, { mood: 'imperative' }));
    expect(englishEngine.render({ ...eat, coordination: { conjunction: 'then', clause: run } })).toBe('eat the mouse, and then run');
  });

  test('the coordinated clause follows the whole conditional', () => {
    const phrase = clause(np(DOG), vp(RUN, { mood: 'conditional' }), {
      condition: clause(np(CAT), vp(EAT, { mood: 'subjunctive' })),
      coordination: { conjunction: 'but', clause: clause(np(BOY), vp(CRY)) },
    });
    expect(englishEngine.render(phrase)).toBe('if the cat ate, the dog would run, but the boy cries');
  });

  // The translator trims the result, so the trailing space the noun-phrase path relies on is harmless.
  test('renderDeterminer names the determiner, with its trailing space', () => {
    expect(menuDeterminer(CAT)).toBe('the ');
    expect(menuDeterminer({ ...CAT, definiteness: 'indefinite' })).toBe('a ');
    expect(menuDeterminer({ ...OBJECT, definiteness: 'indefinite' })).toBe('an ');
    expect(menuDeterminer({ ...WATER, definiteness: 'many' })).toBe('much ');
    expect(menuDeterminer({ ...CAT, definiteness: 'no' })).toBe('no ');
  });

  test('renderDeterminer is empty where English spells no determiner', () => {
    expect(menuDeterminer({ ...CAT, definiteness: 'bare' })).toBe('');
    expect(menuDeterminer({ ...CAT, number: 'plural', definiteness: 'indefinite' })).toBe('');
    expect(menuDeterminer({ ...AFRICA, definiteness: 'this' })).toBe('');
  });

  test('renderDeterminer reads plurality off number, falling back to count', () => {
    expect(menuDeterminer({ ...BOOK, number: 'plural', definiteness: 'this' })).toBe('these ');
    expect(menuDeterminer({ ...BOOK, count: 'plural', definiteness: 'that' })).toBe('those ');
    expect(menuDeterminer({ ...BOOK, count: 'plural', number: 'singular', definiteness: 'that' })).toBe('that ');
  });

  test('has no renderWord, since English adjectives do not agree', () => {
    expect(englishEngine.renderWord).toBeUndefined();
  });
});
