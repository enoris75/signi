import { describe, expect, test } from 'vitest';
import {
  adj, ALT, CANSAT, CASA, clause, complement, complements, CORRER, el, ELLA, ES, GAT, GOS, GRAN, group, HAVER_DE, MENJAR,
  MENJAR_N, MIDA, modal, NEN, NOSALTRES, np, RATOLI, SER, TU, VELOCITAT, VEURE, vp, JO, type Forms,
} from './ca.fixtures.js';
import { renderClause } from './renderClause.js';

const PLORAR: Forms = { base: 'plorar', '3sg_present': 'plora' };
const food = el(np(MENJAR_N));

describe('renderClause', () => {
  describe('verbless periods', () => {
    test('a bare noun phrase stands on its own', () => {
      expect(renderClause(clause(np(GAT, {}, { adjectives: [adj(GRAN)] })))).toBe('el gat gran');
      expect(renderClause(clause(el(np(GAT), np(GOS))))).toBe('el gat i el gos');
      expect(renderClause(clause(np(JO)))).toBe('jo');
    });

    test('a dimension or manner gloss is its adposition + the noun phrase', () => {
      expect(renderClause(clause(np(MIDA, { definiteness: 'bare' }, { adjectives: [adj(GRAN)], dimensionGloss: true })))).toBe('de mida gran');
      expect(renderClause(clause(np(VELOCITAT, { definiteness: 'bare' }, { adjectives: [adj(ALT)], mannerGloss: true })))).toBe('a velocitat alta');
    });
  });

  describe('declarative', () => {
    test('subject, verb, object', () => {
      expect(renderClause(clause(np(GAT), vp(MENJAR), { directObject: el(np(RATOLI)) }))).toBe('el gat menja el ratolí');
      expect(renderClause(clause(np(GAT, { number: 'plural' }), vp(MENJAR)))).toBe('els gats mengen');
    });

    test('a coordinated subject agrees as a group: i as a plural, o with the last conjunct', () => {
      expect(renderClause(clause(el(np(GAT), np(GOS)), vp(CORRER)))).toBe('el gat i el gos corren');
      expect(renderClause(clause(group('or', np(GAT), np(GOS)), vp(CORRER)))).toBe('el gat o el gos corre');
    });

    test('a subject pronoun is dropped (pro-drop), the verb ending carrying the person', () => {
      expect(renderClause(clause(np(JO), vp(MENJAR)))).toBe('menjo');
      expect(renderClause(clause(np(NOSALTRES), vp(MENJAR), { directObject: food }))).toBe('mengem el menjar');
      expect(renderClause(clause(np(ELLA), vp(SER, {}, 'BE'), { complements: complements({ predicative: complement(np(CANSAT)) }) }))).toBe('està cansada');
    });

    test('a pronoun inside a coordinated subject is kept', () => {
      expect(renderClause(clause(el(np(GAT), np(JO)), vp(MENJAR)))).toBe('el gat i jo mengem');
    });

    test('a generic subject surfaces only as the impersonal es', () => {
      expect(renderClause(clause(np(ES), vp(MENJAR), { directObject: food }))).toBe('es menja el menjar');
    });

    test('the subject keeps its relative clause', () => {
      expect(renderClause(clause(np(NEN, {}, { relative: { headRole: 'subject', verbPhrase: vp(PLORAR) } }), vp(MENJAR)))).toBe('el nen que plora menja');
    });

    test('the predicate brings tense, aspect, modals and complements', () => {
      expect(renderClause(clause(np(GAT), vp(MENJAR, { aspect: 'resultative', modals: [modal(HAVER_DE)] })))).toBe("el gat ha d'haver menjat");
      expect(renderClause(clause(np(GAT), vp(SER, {}, 'BE'), { complements: complements({ locative: complement(np(CASA)) }) }))).toBe('el gat és a la casa');
    });

    test('a cap subject and a cap object both take the no', () => {
      expect(renderClause(clause(np(GAT, { definiteness: 'no' }), vp(MENJAR)))).toBe('cap gat no menja');
      expect(renderClause(clause(np(GAT), vp(VEURE), { directObject: el(np(RATOLI, { definiteness: 'no' })) }))).toBe('el gat no veu cap ratolí');
    });
  });

  describe('subjectless moods', () => {
    test('a command drops its subject', () => {
      expect(renderClause(clause(np(TU), vp(MENJAR, { mood: 'imperative' }, 'EAT'), { directObject: food }))).toBe('menja el menjar');
      expect(renderClause(clause(np(NOSALTRES), vp(MENJAR, { mood: 'imperative', negative: true }, 'EAT')))).toBe('no mengem');
    });

    test('an infinitive drops even a noun subject', () => {
      expect(renderClause(clause(np(GAT), vp(MENJAR, { mood: 'infinitive' }), { directObject: food }))).toBe('menjar el menjar');
    });
  });

  test('renders only its own clause, ignoring any condition or coordination', () => {
    const phrase = clause(np(GOS), vp(CORRER, { mood: 'conditional' }), {
      condition: clause(np(GAT), vp(MENJAR, { mood: 'subjunctive' })),
      coordination: { conjunction: 'and', clause: clause(np(GAT), vp(MENJAR)) },
    });
    expect(renderClause(phrase)).toBe('el gos correria');
  });
});
