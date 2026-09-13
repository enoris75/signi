import { describe, expect, test } from 'vitest';
import {
  adj, ALTO, CANSADO, CASA, clause, COMER, COMIDA, complement, complements, CORRER, DEBER, el, ELLA, type Forms, GATO, GRANDE, group,
  modal, NINO, NOSOTROS, np, PERRO, RATON, SE, SER, TAMANO, TU, VELOCIDAD, VER, vp, YO,
} from './es.fixtures.js';
import { renderClause } from './renderClause.js';

const LLORAR: Forms = { base: 'llorar', '3sg_present': 'llora' };
const food = el(np(COMIDA));

describe('renderClause', () => {
  describe('verbless periods', () => {
    test('a bare noun phrase stands on its own', () => {
      expect(renderClause(clause(np(GATO, {}, { adjectives: [adj(GRANDE)] })))).toBe('el gato grande');
      expect(renderClause(clause(el(np(GATO), np(PERRO))))).toBe('el gato y el perro');
    });

    test('a pronoun is not dropped without a verb', () => {
      expect(renderClause(clause(np(YO)))).toBe('yo');
    });

    test('a dimension gloss is its adposition + the dimension noun phrase', () => {
      const subject = np(TAMANO, { definiteness: 'bare' }, { adjectives: [adj(GRANDE)], dimensionGloss: true });
      expect(renderClause(clause(subject))).toBe('de tamaño grande');
    });

    test('a manner gloss is its adposition + the manner noun phrase', () => {
      const subject = np(VELOCIDAD, { definiteness: 'bare' }, { adjectives: [adj(ALTO)], mannerGloss: true });
      expect(renderClause(clause(subject))).toBe('a velocidad alta');
    });
  });

  describe('declarative', () => {
    test('subject, verb, object', () => {
      expect(renderClause(clause(np(GATO), vp(COMER), { directObject: food }))).toBe('el gato come la comida');
      expect(renderClause(clause(np(GATO, { number: 'plural' }), vp(COMER)))).toBe('los gatos comen');
    });

    test('a coordinated subject agrees as a group: y as a plural, o with the last conjunct', () => {
      expect(renderClause(clause(el(np(GATO), np(PERRO)), vp(CORRER)))).toBe('el gato y el perro corren');
      expect(renderClause(clause(group('or', np(GATO), np(PERRO)), vp(CORRER)))).toBe('el gato o el perro corre');
    });

    test('a subject pronoun is dropped, the verb ending carrying the person', () => {
      expect(renderClause(clause(np(YO), vp(COMER)))).toBe('como');
      expect(renderClause(clause(np(NOSOTROS), vp(COMER), { directObject: food }))).toBe('comemos la comida');
      expect(renderClause(clause(np(ELLA), vp(SER, {}, 'BE'), { complements: complements({ predicative: complement(np(CANSADO)) }) })))
        .toBe('está cansada');
    });

    test('a pronoun inside a coordinated subject is kept', () => {
      expect(renderClause(clause(el(np(GATO), np(YO)), vp(COMER)))).toBe('el gato y yo comemos');
    });

    test('a generic subject surfaces only as the impersonal se', () => {
      expect(renderClause(clause(np(SE), vp(COMER), { directObject: food }))).toBe('se come la comida');
    });

    test('the subject keeps its relative clause', () => {
      const cries = { headRole: 'subject' as const, verbPhrase: vp(LLORAR) };
      expect(renderClause(clause(np(NINO, {}, { relative: cries }), vp(COMER)))).toBe('el niño que llora come');
    });

    test('the predicate brings tense, aspect, modals and complements', () => {
      expect(renderClause(clause(np(GATO), vp(COMER, { aspect: 'resultative', modals: [modal(DEBER)] })))).toBe('el gato debe haber comido');
      expect(renderClause(clause(np(GATO), vp(SER, {}, 'BE'), { complements: complements({ locative: complement(np(CASA)) }) })))
        .toBe('el gato está en la casa');
    });

    test('a ningún subject negates without no; a ningún object needs it', () => {
      expect(renderClause(clause(np(GATO, { definiteness: 'no' }), vp(COMER, { negative: true })))).toBe('ningún gato come');
      expect(renderClause(clause(np(GATO), vp(VER), { directObject: el(np(RATON, { definiteness: 'no' })) }))).toBe('el gato no ve ningún ratón');
    });
  });

  describe('subjectless moods', () => {
    test('a command drops its subject', () => {
      expect(renderClause(clause(np(TU), vp(COMER, { mood: 'imperative' }, 'EAT'), { directObject: food }))).toBe('come la comida');
      expect(renderClause(clause(np(NOSOTROS), vp(COMER, { mood: 'imperative', negative: true }, 'EAT')))).toBe('no comamos');
    });

    test('an infinitive drops even a noun subject', () => {
      expect(renderClause(clause(np(GATO), vp(COMER, { mood: 'infinitive' }), { directObject: food }))).toBe('comer la comida');
    });
  });

  test('renders only its own clause, ignoring any condition or coordination', () => {
    const phrase = clause(np(PERRO), vp(CORRER, { mood: 'conditional' }), {
      condition: clause(np(GATO), vp(COMER, { mood: 'subjunctive' })),
      coordination: { conjunction: 'and', clause: clause(np(GATO), vp(COMER)) },
    });
    expect(renderClause(phrase)).toBe('el perro correría');
  });
});
