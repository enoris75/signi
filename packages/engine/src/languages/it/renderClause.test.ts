import { describe, expect, test } from 'vitest';
import {
  adj, ALTO, ANDARE, BUONO, CANE, CASA, CIBO, clause, complement, complements, concept, CORRERE, CROLLARE, DIMENSIONE, DOVERE, el,
  ESSERE, GATTA, GATTO, GRANDE, IO, LEI, LORO, MANGIARE, MERCATO, modal, MODO, NOI, np, SEMBRARE, SI, STANCO, TOPO, TU, VECCHIO,
  VEDERE, VELOCITA, vp,
} from './it.fixtures.js';
import { renderClause } from './renderClause.js';

const mouse = el(np(TOPO));
const food = el(np(CIBO));

describe('renderClause', () => {
  describe('verbless periods', () => {
    test('a bare noun phrase stands on its own', () => {
      expect(renderClause(clause(np(GATTO, {}, { adjectives: [concept(GRANDE, 'BIG')] })))).toBe('il grande gatto');
    });

    test('a dimension gloss is a prepositional fragment', () => {
      const size = np(DIMENSIONE, { definiteness: 'bare' }, { adjectives: [concept(GRANDE, 'BIG')], dimensionGloss: true });
      expect(renderClause(clause(size))).toBe('di grande dimensione');
    });

    test('a manner gloss is the adverbial fragment', () => {
      const way = np(MODO, { definiteness: 'indefinite' }, { adjectives: [concept(BUONO, 'GOOD')], mannerGloss: true });
      const speed = np(VELOCITA, { definiteness: 'bare' }, { adjectives: [adj(ALTO)], mannerGloss: true });
      expect(renderClause(clause(way))).toBe('in un buon modo');
      expect(renderClause(clause(speed))).toBe('a velocità alta');
    });

    test('a gloss flag is ignored once the clause has a verb', () => {
      expect(renderClause(clause(np(VELOCITA, {}, { mannerGloss: true }), vp(CROLLARE)))).toBe('la velocità crolla');
    });
  });

  describe('subject', () => {
    test('a noun subject precedes the predicate', () => {
      expect(renderClause(clause(np(GATTO), vp(MANGIARE), { directObject: mouse }))).toBe('il gatto mangia il topo');
    });

    // Fixed A40: Italian is pro-drop; the verb ending alone carries the person.
    test('a bare pronoun subject is dropped, still agreeing the verb', () => {
      expect(renderClause(clause(np(IO), vp(MANGIARE)))).toBe('mangio');
      expect(renderClause(clause(np(LORO), vp(MANGIARE), { directObject: mouse }))).toBe('mangiano il topo');
      expect(renderClause(clause(np(LEI), vp(ANDARE, { aspect: 'resultative' })))).toBe('è andata');
    });

    test('a coordinated subject is kept, and agrees as a group', () => {
      expect(renderClause(clause(el(np(IO), np(GATTO)), vp(MANGIARE)))).toBe('io e il gatto mangiamo');
      expect(renderClause(clause(el(np(GATTA), np(CANE)), vp(SEMBRARE), { complements: complements({ predicative: complement(np(VECCHIO)) }) })))
        .toBe('la gatta e il cane sembrano vecchi');
    });

    test('an impersonal subject surfaces only as the si clitic', () => {
      expect(renderClause(clause(np(SI), vp(MANGIARE), { directObject: mouse }))).toBe('si mangia il topo');
    });

    test('a nessun subject carries the negation, so the predicate takes no non', () => {
      const noMouse = el(np(TOPO, { definiteness: 'no' }));
      expect(renderClause(clause(np(GATTO, { definiteness: 'no' }), vp(MANGIARE), { directObject: noMouse }))).toBe('nessun gatto mangia nessun topo');
      expect(renderClause(clause(np(GATTO), vp(MANGIARE), { directObject: noMouse }))).toBe('il gatto non mangia nessun topo');
    });
  });

  describe('predicate', () => {
    test('carries tense, aspect, modals, object clitics and complements', () => {
      expect(renderClause(clause(np(GATTO), vp(MANGIARE, { tense: 'past' })))).toBe('il gatto mangiò');
      expect(renderClause(clause(np(GATTO), vp(MANGIARE, { aspect: 'resultative', modals: [modal(DOVERE)] })))).toBe('il gatto deve aver mangiato');
      expect(renderClause(clause(np(GATTO), vp(VEDERE, { negative: true }), { directObject: el(np(IO)) }))).toBe('il gatto non mi vede');
      const route = complements({ source: complement(np(CASA)), direction: complement(np(MERCATO)) });
      expect(renderClause(clause(np(GATTO), vp(ANDARE, {}, 'GO'), { complements: route }))).toBe('il gatto va dalla casa al mercato');
    });

    test('a hypothetical mood reaches the finite verb', () => {
      expect(renderClause(clause(np(CANE), vp(CORRERE, { mood: 'conditional' })))).toBe('il cane correrebbe');
      expect(renderClause(clause(np(GATTO), vp(MANGIARE, { mood: 'conditional', modals: [modal(DOVERE)] }), { directObject: mouse })))
        .toBe('il gatto dovrebbe mangiare il topo');
    });
  });

  describe('imperative', () => {
    test('drops the subject, which still picks the form', () => {
      expect(renderClause(clause(np(TU), vp(MANGIARE, { mood: 'imperative' }), { directObject: food }))).toBe('mangia il cibo');
      expect(renderClause(clause(np(NOI), vp(MANGIARE, { mood: 'imperative' })))).toBe('mangiamo');
      expect(renderClause(clause(np(TU), vp(MANGIARE, { mood: 'imperative', negative: true }), { directObject: food }))).toBe('non mangiare il cibo');
    });

    // C02: Italian instructions stay imperative, in the tu form.
    test('an instruction is the tu imperative', () => {
      expect(renderClause(clause(np(NOI), vp(MANGIARE, { mood: 'imperative', register: 'instruction' }), { directObject: food })))
        .toBe('mangia il cibo');
    });
  });

  describe('infinitive', () => {
    test('drops the subject and renders the citation infinitive', () => {
      expect(renderClause(clause(np(GATTO), vp(MANGIARE, { mood: 'infinitive' }), { directObject: food }))).toBe('mangiare il cibo');
      expect(renderClause(clause(np(GATTO), vp(MANGIARE, { mood: 'infinitive', negative: true })))).toBe('non mangiare');
    });

    // The generic subject a citation carries is nobody, not the impersonal si and its plural agreement.
    test("a citation's predicate adjective takes the citation form", () => {
      const tired = complements({ predicative: complement(np(STANCO)) });
      expect(renderClause(clause(np(SI), vp(ESSERE, { mood: 'infinitive' }, 'BE'), { complements: tired }))).toBe('essere stanco');
      expect(renderClause(clause(np(SI), vp(ESSERE, {}, 'BE'), { complements: tired }))).toBe('si è stanchi');
    });
  });

  describe('infinitive complement', () => {
    const CAPACE = { role: 'adjective', base: 'capace', infinitive_link: 'di' };
    const able = complements({ predicative: complement(np(CAPACE)) });

    test("follows the clause after its governor's link, agreeing with the subject", () => {
      const eats = clause(np(GATTA), vp(MANGIARE, { mood: 'infinitive' }), { directObject: food });
      expect(renderClause(clause(np(GATTA), vp(ESSERE, {}, 'BE'), { complements: able, infinitiveComplement: eats })))
        .toBe('la gatta è capace di mangiare il cibo');
    });

    test('a citation hands its citation agreement down', () => {
      const tired = clause(np(SI), vp(ESSERE, { mood: 'infinitive' }, 'BE'), { complements: complements({ predicative: complement(np(STANCO)) }) });
      expect(renderClause(clause(np(SI), vp(ESSERE, { mood: 'infinitive' }, 'BE'), { complements: able, infinitiveComplement: tired })))
        .toBe('essere capace di essere stanco');
    });
  });
});
