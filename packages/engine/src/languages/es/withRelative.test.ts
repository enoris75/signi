import { describe, expect, test } from 'vitest';
import { ARDER, CASA, COMER, COMIDA, complement, CORRER, CREADOR, el, type Forms, FRASE, GATO, LIBRO, NINO, nounModifier, np, SE, vp, YO } from './es.fixtures.js';
import { withRelative } from './withRelative.js';

const LLORAR: Forms = { base: 'llorar', '3sg_present': 'llora', '3pl_present': 'lloran' };
const LEER: Forms = { base: 'leer', '1sg_present': 'leo', '3sg_present': 'lee', '3pl_present': 'leen' };

describe('withRelative', () => {
  test('without a relative clause it appends the attributive nouns and the possessor', () => {
    expect(withRelative('el gato', np(GATO))).toBe('el gato');
    const phrase = np(CREADOR, {}, { nounModifiers: [nounModifier({ ...FRASE, number: 'plural' })], possessor: np(NINO) });
    expect(withRelative('el creador', phrase)).toBe('el creador de frases del niño');
  });

  test('a subject relative is que + a predicate agreeing with the head', () => {
    const cries = { headRole: 'subject' as const, verbPhrase: vp(LLORAR) };
    expect(withRelative('el niño', np(NINO, {}, { relative: cries }))).toBe('el niño que llora');
    expect(withRelative('los niños', np(NINO, { number: 'plural' }, { relative: cries }))).toBe('los niños que lloran');
  });

  test('the relative predicate carries its own tense, negation, object and complements', () => {
    const ate = { headRole: 'subject' as const, verbPhrase: vp(COMER, { tense: 'past' }), directObject: el(np(COMIDA)) };
    expect(withRelative('el gato', np(GATO, {}, { relative: ate }))).toBe('el gato que comió la comida');
    const doesNotEat = { headRole: 'subject' as const, verbPhrase: vp(COMER, { negative: true }) };
    expect(withRelative('el gato', np(GATO, {}, { relative: doesNotEat }))).toBe('el gato que no come');
    const runsHome = { headRole: 'subject' as const, verbPhrase: vp(CORRER, {}, 'RUN'), complements: { direction: complement(np(CASA)) } };
    expect(withRelative('el gato', np(GATO, {}, { relative: runsHome }))).toBe('el gato que corre a la casa');
  });

  test('an object relative names its own subject, which drives agreement', () => {
    const read = (subject: Forms, extra: Forms = {}) =>
      ({ headRole: 'directObject' as const, subject: el(np(subject, extra)), verbPhrase: vp(LEER) });
    expect(withRelative('el libro', np(LIBRO, {}, { relative: read(NINO, { number: 'plural' }) }))).toBe('el libro que los niños leen');
    expect(withRelative('el libro', np(LIBRO, {}, { relative: read(YO) }))).toBe('el libro que yo leo');
  });

  test('a gap with no subject of its own agrees with the head', () => {
    expect(withRelative('el niño', np(NINO, {}, { relative: { headRole: 'directObject', verbPhrase: vp(LLORAR) } }))).toBe('el niño que llora');
  });

  test('a generic subject is the impersonal se, not a subject word', () => {
    const eaten = { headRole: 'directObject' as const, subject: el(np(SE)), verbPhrase: vp(COMER) };
    expect(withRelative('una comida', np(COMIDA, { definiteness: 'indefinite' }, { relative: eaten }))).toBe('una comida que se come');
  });

  test('the relative clause follows the possessor', () => {
    const burns = { headRole: 'subject' as const, verbPhrase: vp(ARDER) };
    expect(withRelative('el libro', np(LIBRO, {}, { possessor: np(GATO), relative: burns }))).toBe('el libro del gato que arde');
  });
});
