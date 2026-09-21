import type { CoordConjunction } from '@signi/shared';
import { describe, expect, test } from 'vitest';
import {
  BUCH, clause, complement, complements, concept, DU, el, ESSEN, type Forms, GEHEN, HAUS, JUNGE, KATER, KATZE, MAN, MANN, MAUS,
  MESSER, np, SCHNEIDEN, vp, WAEHLEN, WASSER,
} from './de.fixtures.js';
import { germanEngine } from './germanEngine.js';

const SEHEN: Forms = { base: 'sehen', participle: 'gesehen', '3sg_present': 'sieht' };

const catEats = clause(np(KATER), vp(ESSEN));
const manGoes = clause(np(MANN), vp(GEHEN));
const joined = (conjunction: CoordConjunction) =>
  germanEngine.render({ ...catEats, coordination: { conjunction, clause: manGoes } });
// `renderDeterminer` is optional on LanguageEngine; the German engine implements it.
const menuDeterminer = (forms: Forms) => germanEngine.renderDeterminer?.(concept(forms));

describe('germanEngine', () => {
  test('is the German engine', () => {
    expect(germanEngine.language).toBe('de');
  });

  test('renders a plain clause, leaving the full stop to the translator', () => {
    expect(germanEngine.render(clause(np(KATER), vp(ESSEN), { directObject: el(np(MAUS)) }))).toBe('der Kater isst die Maus');
  });

  test('a conditional leads with the verb-final wenn clause and inverts the main clause', () => {
    const phrase = clause(np(MANN), vp(GEHEN, { mood: 'conditional' }), {
      condition: clause(np(KATER), vp(ESSEN, { mood: 'subjunctive' }), { directObject: el(np(MAUS)) }),
    });
    expect(germanEngine.render(phrase)).toBe('wenn der Kater die Maus essen würde, würde der Mann gehen');
  });

  test('und, oder, aber and das heißt leave the second clause in V2 order', () => {
    expect(joined('and')).toBe('der Kater isst, und der Mann geht');
    expect(joined('or')).toBe('der Kater isst, oder der Mann geht');
    expect(joined('but')).toBe('der Kater isst, aber der Mann geht');
    // A192: parenthetical, so it takes a comma after it too — and still leaves the clause in V2.
    expect(joined('that_is')).toBe('der Kater isst, das heißt, der Mann geht');
  });

  test('also and und dann claim the front field and invert the second clause', () => {
    expect(joined('therefore')).toBe('der Kater isst, also geht der Mann');
    expect(joined('then')).toBe('der Kater isst, und dann geht der Mann');
  });

  test('coordinated commands stay subjectless even after an inverting conjunction', () => {
    const eat = clause(np(DU), vp(ESSEN, { mood: 'imperative' }, 'EAT'), { directObject: el(np(MAUS)) });
    const go = clause(np(DU), vp(GEHEN, { mood: 'imperative' }, 'GO'));
    expect(germanEngine.render({ ...eat, coordination: { conjunction: 'then', clause: go } })).toBe('iss die Maus, und dann geh');
  });

  test('pulls a means clause’s leading comma onto the verb', () => {
    const means = complements({
      instrumental: complement(np(MESSER, { definiteness: 'indefinite' }), [{ kind: 'abstraction', value: 'process' }], vp(WAEHLEN)),
    });
    expect(germanEngine.render(clause(np(MAN), vp(SCHNEIDEN), { complements: means }))).toBe('man schneidet, indem man ein Messer wählt');
  });

  test('a relative clause’s closing comma is dropped at the end and merged before a coordinated clause', () => {
    const cat = np(KATER, {}, { relative: { headRole: 'subject', verbPhrase: vp(ESSEN) } });
    const seesCat = clause(np(JUNGE), vp(SEHEN), { directObject: el(cat) });
    expect(germanEngine.render(seesCat)).toBe('der Junge sieht den Kater, der isst');
    expect(germanEngine.render({ ...seesCat, coordination: { conjunction: 'and', clause: manGoes } }))
      .toBe('der Junge sieht den Kater, der isst, und der Mann geht');
  });

  test('renderDeterminer names the determiner in the nominative', () => {
    expect(menuDeterminer(KATER)).toBe('der');
    expect(menuDeterminer({ ...KATZE, definiteness: 'indefinite' })).toBe('eine');
    expect(menuDeterminer({ ...HAUS, definiteness: 'no' })).toBe('kein');
    expect(menuDeterminer({ ...WASSER, definiteness: 'some' })).toBe('etwas');
  });

  test('renderDeterminer reads plurality off number, falling back to count', () => {
    expect(menuDeterminer({ ...BUCH, number: 'plural' })).toBe('die');
    expect(menuDeterminer({ ...BUCH, count: 'plural' })).toBe('die');
    expect(menuDeterminer({ ...BUCH, count: 'plural', number: 'singular' })).toBe('das');
    expect(menuDeterminer({ ...BUCH, number: 'plural', definiteness: 'indefinite' })).toBe('');
  });
});
