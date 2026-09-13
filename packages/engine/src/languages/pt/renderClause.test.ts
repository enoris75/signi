import { describe, expect, test } from 'vitest';
import { renderClause } from './renderClause.js';
import {
  adj, ALTO, BOM, CANSADO, CAO, CASA, clause, COMER, complement, complements, concept, DAR, DEVER, el, ELA, ELE, EU, type Forms, GATO, GRANDE,
  LIVRO, MANEIRA, modal, NOS, np, NUNCA, RATO, SE, SER, TAMANHO, TEMPERATURA, VELOCIDADE, VER, VOCE, vp,
} from './pt.fixtures.js';

const CORRER: Forms = { base: 'correr', gerund: 'correndo', '3sg_present': 'corre', '3pl_present': 'correm', '1sg_future': 'correrei' };

const mouse = el(np(RATO));

describe('renderClause', () => {
  describe('verbless periods', () => {
    test('a bare noun phrase stands on its own', () => {
      expect(renderClause(clause(np(GATO, {}, { adjectives: [adj(GRANDE)] })))).toBe('o gato grande');
      expect(renderClause(clause(np(TEMPERATURA, { definiteness: 'indefinite' })))).toBe('uma temperatura');
    });

    test('a pronoun is kept when there is no verb to carry its person', () => {
      expect(renderClause(clause(np(EU)))).toBe('eu');
    });

    test('a dimension gloss is a prepositional fragment', () => {
      const bigSize = np(TAMANHO, { definiteness: 'bare' }, { adjectives: [adj(GRANDE)], dimensionGloss: true });
      expect(renderClause(clause(bigSize))).toBe('de tamanho grande');
      const highTemperature = np(TEMPERATURA, { definiteness: 'bare' }, { adjectives: [adj(ALTO)], dimensionGloss: true });
      expect(renderClause(clause(highTemperature))).toBe('a temperatura alta');
    });

    test('a manner gloss takes the adposition of its manner relation', () => {
      const highSpeed = np(VELOCIDADE, { definiteness: 'bare' }, { adjectives: [adj(ALTO)], mannerGloss: true });
      const goodWay = np(MANEIRA, { definiteness: 'indefinite' }, { adjectives: [concept(BOM, 'GOOD')], mannerGloss: true });
      expect(renderClause(clause(highSpeed))).toBe('a velocidade alta');
      expect(renderClause(clause(goodWay))).toBe('de uma maneira boa');
    });
  });

  describe('declarative', () => {
    test('subject, verb, object', () => {
      expect(renderClause(clause(np(GATO), vp(COMER), { directObject: mouse }))).toBe('o gato come o rato');
      expect(renderClause(clause(np(GATO), vp(DAR, {}, 'GIVE'), { directObject: el(np(LIVRO)), complements: complements({ terminus: complement(np(CAO)) }) })))
        .toBe('o gato dá o livro ao cão');
    });

    test('the verb agrees with a coordinated subject', () => {
      expect(renderClause(clause(el(np(GATO), np(CAO)), vp(CORRER)))).toBe('o gato e o cão correm');
    });

    // Portuguese is pro-drop: the verb ending carries the person.
    test('a lone pronoun subject is dropped', () => {
      expect(renderClause(clause(np(EU), vp(COMER)))).toBe('como');
      expect(renderClause(clause(np(ELA), vp(COMER), { directObject: mouse }))).toBe('come o rato');
      expect(renderClause(clause(np(NOS), vp(COMER)))).toBe('comemos');
    });

    test('a coordination of pronouns keeps its surface', () => {
      expect(renderClause(clause(el(np(EU), np(ELE)), vp(COMER)))).toBe('eu e ele comemos');
    });

    test('the impersonal subject surfaces only as the proclitic "se"', () => {
      expect(renderClause(clause(np(SE), vp(COMER), { directObject: mouse }))).toBe('se come o rato');
    });

    test('tense, aspect and modals shape the verb group', () => {
      expect(renderClause(clause(np(GATO), vp(COMER, { tense: 'past' })))).toBe('o gato comeu');
      expect(renderClause(clause(np(GATO), vp(COMER, { aspect: 'progressive' }), { directObject: mouse }))).toBe('o gato está comendo o rato');
      expect(renderClause(clause(np(GATO), vp(COMER, { aspect: 'resultative', modals: [modal(DEVER)] })))).toBe('o gato deve ter comido');
    });

    test('negation and fronted nunca', () => {
      expect(renderClause(clause(np(GATO), vp(COMER, { negative: true })))).toBe('o gato não come');
      expect(renderClause(clause(np(GATO, { definiteness: 'no' }), vp(COMER, { negative: true })))).toBe('nenhum gato come');
      expect(renderClause(clause(np(GATO), vp(COMER, { modifier: concept(NUNCA) }), { directObject: el(np(RATO, { definiteness: 'no' })) })))
        .toBe('o gato nunca come nenhum rato');
    });

    test('a pronoun object is a proclitic', () => {
      expect(renderClause(clause(np(GATO), vp(VER), { directObject: el(np(EU)) }))).toBe('o gato me vê');
      expect(renderClause(clause(np(GATO), vp(VER, { negative: true }), { directObject: el(np(EU)) }))).toBe('o gato não me vê');
    });

    test('BE with a place or a transient state is estar', () => {
      const be = vp(SER, {}, 'BE');
      expect(renderClause(clause(np(GATO), be, { complements: complements({ locative: complement(np(CASA)) }) }))).toBe('o gato está na casa');
      expect(renderClause(clause(np(GATO), be, { complements: complements({ predicative: complement(np(CANSADO)) }) }))).toBe('o gato está cansado');
      expect(renderClause(clause(np(GATO), be, { complements: complements({ predicative: complement(np(GRANDE)) }) }))).toBe('o gato é grande');
    });

    test('a relative clause on the subject', () => {
      const eats = np(GATO, {}, { relative: { headRole: 'subject', verbPhrase: vp(COMER) } });
      expect(renderClause(clause(eats, vp(CORRER)))).toBe('o gato que come corre');
    });
  });

  describe('hypothetical moods', () => {
    test('each clause of a conditional renders its own mood', () => {
      expect(renderClause(clause(np(CAO), vp(CORRER, { mood: 'conditional' })))).toBe('o cão correria');
      expect(renderClause(clause(np(GATO), vp(COMER, { mood: 'subjunctive' }), { directObject: mouse }))).toBe('o gato comesse o rato');
      expect(renderClause(clause(np(EU), vp(COMER, { mood: 'conditional' })))).toBe('comeria');
    });
  });

  describe('imperative', () => {
    test('the addressee is dropped and picks the command form', () => {
      expect(renderClause(clause(np(VOCE), vp(COMER, { mood: 'imperative' }, 'EAT'), { directObject: mouse }))).toBe('coma o rato');
      expect(renderClause(clause(np(VOCE, { number: 'plural' }), vp(COMER, { mood: 'imperative' }, 'EAT')))).toBe('comam');
      expect(renderClause(clause(np(VOCE), vp(COMER, { mood: 'imperative', negative: true }, 'EAT')))).toBe('não coma');
    });

    test('the instruction register is the infinitive', () => {
      expect(renderClause(clause(np(VOCE), vp(COMER, { mood: 'imperative', register: 'instruction' }, 'EAT'), { directObject: mouse })))
        .toBe('comer o rato');
    });
  });

  describe('infinitive', () => {
    test('drops even a noun subject', () => {
      expect(renderClause(clause(np(GATO), vp(COMER, { mood: 'infinitive' }), { directObject: mouse }))).toBe('comer o rato');
      expect(renderClause(clause(np(GATO), vp(COMER, { mood: 'infinitive', negative: true })))).toBe('não comer');
    });
  });
});
