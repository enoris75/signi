import { describe, expect, test } from 'vitest';
import {
  ARDER, CASA, COMER, COMIDA, complement, CORRER, CREADOR, DAR, EL, el, ELLA, ELLOS, type Forms, FRASE, GATO, LIBRO, MUJER, NINO, NOSOTROS,
  nounModifier, np, SE, TU, VER, vp, YO,
} from './es.fixtures.js';
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
    expect(withRelative('el libro', np(LIBRO, {}, { relative: read(YO) }))).toBe('el libro que leo');
  });

  // A173: a pronoun subject drops, as in the main clause, unless "que" would then read as a subject
  // relative: the verb agrees with the head too, in the 3rd person or in a form shared with it.
  test('a pronoun subject drops where the verb still tells it from the head', () => {
    const sees = (subject: Forms, verbPhrase = vp(VER)) => ({ headRole: 'directObject' as const, subject: el(np(subject)), verbPhrase });
    expect(withRelative('el libro', np(LIBRO, {}, { relative: sees(NOSOTROS) }))).toBe('el libro que vemos');
    expect(withRelative('el libro', np(LIBRO, {}, { relative: sees(TU) }))).toBe('el libro que ves');
    expect(withRelative('el gato', np(GATO, {}, { relative: sees(EL) }))).toBe('el gato que él ve');
    expect(withRelative('el gato', np(GATO, {}, { relative: sees(ELLA) }))).toBe('el gato que ella ve');
    expect(withRelative('los gatos', np(GATO, { number: 'plural' }, { relative: sees(ELLOS) }))).toBe('los gatos que ellos ven');
    expect(withRelative('los gatos', np(GATO, { number: 'plural' }, { relative: sees(EL) }))).toBe('los gatos que ve');
    expect(withRelative('el gato', np(GATO, {}, { relative: sees(ELLOS) }))).toBe('el gato que ven');
    // The 1st singular shares its conditional and imperfect-subjunctive form with the 3rd.
    expect(withRelative('el libro', np(LIBRO, {}, { relative: sees(YO, vp(COMER, { mood: 'conditional' })) }))).toBe('el libro que yo comería');
    expect(withRelative('el libro', np(LIBRO, {}, { relative: sees(YO, vp(COMER, { mood: 'subjunctive' })) }))).toBe('el libro que yo comiera');
    expect(withRelative('el libro', np(LIBRO, {}, { relative: sees(TU, vp(COMER, { mood: 'conditional' })) }))).toBe('el libro que comerías');
    // "donde" marks the gap itself, so even the 3rd person drops.
    expect(withRelative('la casa', np(CASA, {}, { relative: { headRole: 'locative', subject: el(np(EL)), verbPhrase: vp(COMER) } })))
      .toBe('la casa donde come');
    expect(withRelative('el libro', np(LIBRO, {}, { relative: { headRole: 'directObject', subject: el(np(YO), np(EL)), verbPhrase: vp(VER) } })))
      .toBe('el libro que yo y él vemos');
  });

  test('a gap with no subject of its own agrees with the head', () => {
    expect(withRelative('el niño', np(NINO, {}, { relative: { headRole: 'directObject', verbPhrase: vp(LLORAR) } }))).toBe('el niño que llora');
  });

  test('a generic subject is the impersonal se, not a subject word', () => {
    const eaten = { headRole: 'directObject' as const, subject: el(np(SE)), verbPhrase: vp(COMER) };
    expect(withRelative('una comida', np(COMIDA, { definiteness: 'indefinite' }, { relative: eaten }))).toBe('una comida que se come');
    // A plural head is the passive se's patient, and the verb agrees with it.
    expect(withRelative('las comidas', np(COMIDA, { number: 'plural' }, { relative: eaten }))).toBe('las comidas que se comen');
  });

  test('the relative clause follows the possessor', () => {
    const burns = { headRole: 'subject' as const, verbPhrase: vp(ARDER) };
    expect(withRelative('el libro', np(LIBRO, {}, { possessor: np(GATO), relative: burns }))).toBe('el libro del gato que arde');
  });

  test('a head filling a complement takes its preposition with the article and que', () => {
    expect(withRelative('la casa', np(CASA, {}, {
      relative: { headRole: 'locative', subject: el(np(GATO)), verbPhrase: vp(COMER), headSpecifiers: [{ kind: 'path', value: 'under' }] },
    }))).toBe('la casa debajo de la que el gato come');
    expect(withRelative('las mujeres', np(MUJER, { number: 'plural' }, {
      relative: { headRole: 'terminus', subject: el(np(GATO)), verbPhrase: vp(DAR, {}, 'GIVE'), directObject: el(np(LIBRO)) },
    }))).toBe('las mujeres a las que el gato da el libro');
    expect(withRelative('el niño', np(NINO, {}, {
      relative: { headRole: 'cause', subject: el(np(GATO)), verbPhrase: vp(COMER), headSpecifiers: [{ kind: 'sentiment', value: 'positive' }] },
    }))).toBe('el niño gracias al que el gato come');
  });

  // C07: the plain place takes the relative adverb, not "en la que".
  test('a plain locative gap is donde, whether or not the default relation was chosen', () => {
    const eatenIn = (subject = el(np(GATO)), extra: Record<string, unknown> = {}) =>
      ({ headRole: 'locative' as const, subject, verbPhrase: vp(COMER), ...extra });
    expect(withRelative('la casa', np(CASA, {}, { relative: eatenIn() }))).toBe('la casa donde el gato come');
    expect(withRelative('la casa', np(CASA, {}, { relative: eatenIn(el(np(GATO)), { headSpecifiers: [{ kind: 'path', value: 'in' }] }) })))
      .toBe('la casa donde el gato come');
    // The head is no object, so a plural one does not make the se passive.
    expect(withRelative('las casas', np(CASA, { number: 'plural' }, { relative: eatenIn(el(np(SE))) }))).toBe('las casas donde se come');
  });

  // A139: the object of a verb that takes it with a preposition relativises on that preposition.
  test('a head that is the object of a prepositional verb takes the preposition with the article and que', () => {
    const CLICAR: Forms = { base: 'clicar', object_prep: 'en', '3sg_present': 'clica', '3pl_present': 'clican' };
    const clicked = (subject: ReturnType<typeof el>) => ({ headRole: 'directObject' as const, subject, verbPhrase: vp(CLICAR) });
    expect(withRelative('el libro', np(LIBRO, {}, { relative: clicked(el(np(GATO))) }))).toBe('el libro en el que el gato clica');
    // The head is no object, so a plural one does not make the se passive.
    expect(withRelative('las casas', np(CASA, { number: 'plural' }, { relative: clicked(el(np(SE))) }))).toBe('las casas en las que se clica');
  });

  // A167: a ningún head negates the matrix clause, not the relative, so the relative keeps its own
  // "no", and a postverbal ningún inside it still demands one. The relative's OWN ningún subject does
  // negate it, as a main clause's does. (The ningún head also puts the relative in the subjunctive, A170.)
  test('a ningún head leaves the relative its own polarity', () => {
    const doesNotEat = { headRole: 'subject' as const, verbPhrase: vp(COMER, { negative: true }) };
    expect(withRelative('ningún gato', np(GATO, { definiteness: 'no' }, { relative: doesNotEat }))).toBe('ningún gato que no coma');
    const ownNoSubject = { headRole: 'directObject' as const, subject: el(np(GATO, { definiteness: 'no' })), verbPhrase: vp(COMER, { negative: true }) };
    expect(withRelative('la comida', np(COMIDA, {}, { relative: ownNoSubject }))).toBe('la comida que ningún gato come');
  });

  // A170: under a ningún head the relative asserts nothing about a real referent, so its verb is in
  // the subjunctive: the present for a present or future relative, the imperfect for a past one.
  test('a ningún head puts the relative in the subjunctive, and any other head keeps the indicative', () => {
    const eats = (verbPhrase: ReturnType<typeof vp>, extra: Record<string, string> = { definiteness: 'no' }) =>
      withRelative('el gato', np(GATO, extra, { relative: { headRole: 'subject', verbPhrase } }));
    expect(eats(vp(COMER))).toBe('el gato que coma');
    expect(eats(vp(COMER, { tense: 'future' }))).toBe('el gato que coma');
    expect(eats(vp(COMER, { tense: 'past' }))).toBe('el gato que comiera');
    expect(eats(vp(COMER), { number: 'plural', definiteness: 'no' })).toBe('el gato que coman');
    expect(eats(vp(COMER, { aspect: 'resultative' }))).toBe('el gato que haya comido');
    expect(eats(vp(COMER), {})).toBe('el gato que come');
    expect(withRelative('la comida', np(COMIDA, { definiteness: 'no' }, {
      relative: { headRole: 'directObject', subject: el(np(GATO)), verbPhrase: vp(COMER) },
    }))).toBe('la comida que el gato coma');
  });
});
