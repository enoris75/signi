import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../../types.js';
import {
  CAO, CASA, COMER, complement, complements, DAR, el, ELA, ELE, ELES, EU, type Forms, GATO, LIVRO, MENINO, MULHER, nounModifier, np, NOS, PALAVRA,
  RATO, SE, VER, VOCE, vp,
} from './pt.fixtures.js';
import { withRelative } from './withRelative.js';

const OBJETO: Forms = { base: 'objeto', plural: 'objetos', gender: 'masc', count: 'singular' };
const ARDER: Forms = { base: 'arder', '3sg_present': 'arde', '3pl_present': 'ardem' };

const subjectRelative = (verbPhrase: ResolvedRelativeClause['verbPhrase'], rest: Partial<ResolvedRelativeClause> = {}): ResolvedRelativeClause =>
  ({ headRole: 'subject', verbPhrase, ...rest });

describe('withRelative', () => {
  test('without a relative, appends the attributive nouns and the possessor', () => {
    expect(withRelative('o gato', np(GATO))).toBe('o gato');
    expect(withRelative('o livro', np(LIVRO, {}, { possessor: np(GATO) }))).toBe('o livro do gato');
    expect(withRelative('o livro', np(LIVRO, {}, { nounModifiers: [nounModifier({ ...PALAVRA, number: 'plural' }, [], 'purpose')] })))
      .toBe('o livro de palavras');
  });

  test('a subject relative is "que" + a predicate agreeing with the head', () => {
    expect(withRelative('o gato', np(GATO, {}, { relative: subjectRelative(vp(COMER)) }))).toBe('o gato que come');
    expect(withRelative('os gatos', np(GATO, { number: 'plural' }, { relative: subjectRelative(vp(COMER)) })))
      .toBe('os gatos que comem');
  });

  test('the relative predicate keeps its own object and complements', () => {
    const gives = subjectRelative(vp(DAR, {}, 'GIVE'), {
      directObject: el(np(LIVRO)),
      complements: complements({ terminus: complement(np(CAO)) }),
    });
    expect(withRelative('o menino', np(MENINO, {}, { relative: gives }))).toBe('o menino que dá o livro ao cão');
  });

  test('an object relative carries its own subject, which drives agreement', () => {
    const iSee: ResolvedRelativeClause = { headRole: 'directObject', subject: el(np(EU)), verbPhrase: vp(VER) };
    expect(withRelative('o livro', np(LIVRO, {}, { relative: iSee }))).toBe('o livro que vejo');
    const catsAte: ResolvedRelativeClause = { headRole: 'directObject', subject: el(np(GATO, { number: 'plural' })), verbPhrase: vp(COMER, { tense: 'past' }) };
    expect(withRelative('o rato', np(RATO, {}, { relative: catsAte }))).toBe('o rato que os gatos comeram');
  });

  // A173: a pronoun subject drops, as in the main clause, unless "que" would then read as a subject
  // relative: the verb agrees with the head too, in the 3rd person, with você, or in a shared form.
  test('a pronoun subject drops where the verb still tells it from the head', () => {
    const sees = (subject: Forms, verbPhrase = vp(VER)): ResolvedRelativeClause => ({ headRole: 'directObject', subject: el(np(subject)), verbPhrase });
    expect(withRelative('o livro', np(LIVRO, {}, { relative: sees(NOS) }))).toBe('o livro que vemos');
    expect(withRelative('o livro', np(LIVRO, {}, { relative: sees(VOCE) }))).toBe('o livro que você vê');
    expect(withRelative('os livros', np(LIVRO, { number: 'plural' }, { relative: sees(VOCE) }))).toBe('os livros que vê');
    expect(withRelative('o gato', np(GATO, {}, { relative: sees(ELE) }))).toBe('o gato que ele vê');
    expect(withRelative('o gato', np(GATO, {}, { relative: sees(ELA) }))).toBe('o gato que ela vê');
    expect(withRelative('os gatos', np(GATO, { number: 'plural' }, { relative: sees(ELES) }))).toBe('os gatos que eles veem');
    expect(withRelative('o gato', np(GATO, {}, { relative: sees(ELES) }))).toBe('o gato que veem');
    // The 1st singular shares its conditional and imperfect-subjunctive form with the 3rd.
    expect(withRelative('o livro', np(LIVRO, {}, { relative: sees(EU, vp(COMER, { mood: 'conditional' })) }))).toBe('o livro que eu comeria');
    expect(withRelative('o livro', np(LIVRO, {}, { relative: sees(EU, vp(COMER, { mood: 'subjunctive' })) }))).toBe('o livro que eu comesse');
    expect(withRelative('o livro', np(LIVRO, {}, { relative: sees(NOS, vp(COMER, { mood: 'conditional' })) }))).toBe('o livro que comeríamos');
    // "onde" marks the gap itself, so even the 3rd person drops.
    expect(withRelative('a casa', np(CASA, {}, { relative: { headRole: 'locative', subject: el(np(ELE)), verbPhrase: vp(COMER) } })))
      .toBe('a casa onde come');
  });

  test('an impersonal subject becomes the proclitic "se"', () => {
    const oneEats: ResolvedRelativeClause = { headRole: 'directObject', subject: el(np(SE)), verbPhrase: vp(COMER) };
    expect(withRelative('um objeto', np(OBJETO, { definiteness: 'indefinite' }, { relative: oneEats }))).toBe('um objeto que se come');
    const oneDoesNotEat = { ...oneEats, verbPhrase: vp(COMER, { negative: true }) };
    expect(withRelative('um objeto', np(OBJETO, { definiteness: 'indefinite' }, { relative: oneDoesNotEat }))).toBe('um objeto que não se come');
  });

  test('the relative follows the possessor', () => {
    expect(withRelative('o livro', np(LIVRO, {}, { possessor: np(GATO), relative: subjectRelative(vp(ARDER)) })))
      .toBe('o livro do gato que arde');
  });

  test('a head filling a complement takes its preposition with the article and qual', () => {
    expect(withRelative('a casa', np(CASA, {}, {
      relative: { headRole: 'locative', subject: el(np(GATO)), verbPhrase: vp(COMER), headSpecifiers: [{ kind: 'path', value: 'under' }] },
    }))).toBe('a casa debaixo da qual o gato come');
    expect(withRelative('a mulher', np(MULHER, {}, {
      relative: { headRole: 'terminus', subject: el(np(GATO)), verbPhrase: vp(DAR, {}, 'GIVE'), directObject: el(np(LIVRO)) },
    }))).toBe('a mulher à qual o gato dá o livro');
    expect(withRelative('os meninos', np(MENINO, { number: 'plural' }, { relative: { headRole: 'source', subject: el(np(GATO)), verbPhrase: vp(COMER) } })))
      .toBe('os meninos dos quais o gato come');
  });

  // C07: the plain place takes the relative adverb, not "na qual".
  test('a plain locative gap is onde, whether or not the default relation was chosen', () => {
    const eatenIn = (subject = el(np(GATO)), rest: Partial<ResolvedRelativeClause> = {}): ResolvedRelativeClause =>
      ({ headRole: 'locative', subject, verbPhrase: vp(COMER), ...rest });
    expect(withRelative('a casa', np(CASA, {}, { relative: eatenIn() }))).toBe('a casa onde o gato come');
    expect(withRelative('a casa', np(CASA, {}, { relative: eatenIn(el(np(GATO)), { headSpecifiers: [{ kind: 'path', value: 'in' }] }) })))
      .toBe('a casa onde o gato come');
    expect(withRelative('um lugar', np(CASA, { definiteness: 'indefinite' }, { relative: eatenIn(el(np(SE)), { verbPhrase: vp(COMER, { negative: true }) }) })))
      .toBe('um lugar onde não se come');
  });

  // A139: the object of a verb that takes it with a preposition relativises on that preposition.
  test('a head that is the object of a prepositional verb takes the preposition contracted with o qual', () => {
    const CLICAR: Forms = { base: 'clicar', object_prep: 'em', '3sg_present': 'clica' };
    const clicked = { headRole: 'directObject' as const, subject: el(np(GATO)), verbPhrase: vp(CLICAR) };
    expect(withRelative('o livro', np(LIVRO, {}, { relative: clicked }))).toBe('o livro no qual o gato clica');
    expect(withRelative('as casas', np(CASA, { number: 'plural' }, { relative: clicked }))).toBe('as casas nas quais o gato clica');
  });

  // A167: a nenhum head negates the matrix clause, not the relative, so the relative keeps its own
  // "não", and a postverbal nenhum inside it still demands one. The relative's OWN nenhum subject does
  // negate it, as a main clause's does. (The nenhum head also puts the relative in the subjunctive, A170.)
  test('a nenhum head leaves the relative its own polarity', () => {
    expect(withRelative('nenhum gato', np(GATO, { definiteness: 'no' }, { relative: subjectRelative(vp(COMER, { negative: true })) })))
      .toBe('nenhum gato que não coma');
    expect(withRelative('o rato', np(RATO, {}, {
      relative: { headRole: 'directObject', subject: el(np(GATO, { definiteness: 'no' })), verbPhrase: vp(COMER, { negative: true }) },
    }))).toBe('o rato que nenhum gato come');
  });

  // A170: under a nenhum head the relative asserts nothing about a real referent, so its verb is in
  // the subjunctive: the present for a present or future relative, the imperfect for a past one.
  test('a nenhum head puts the relative in the subjunctive, and any other head keeps the indicative', () => {
    const eats = (verbPhrase: ReturnType<typeof vp>, extra: Record<string, string> = { definiteness: 'no' }) =>
      withRelative('o gato', np(GATO, extra, { relative: subjectRelative(verbPhrase) }));
    expect(eats(vp(COMER))).toBe('o gato que coma');
    expect(eats(vp(COMER, { tense: 'past' }))).toBe('o gato que comesse');
    expect(eats(vp(COMER), { number: 'plural', definiteness: 'no' })).toBe('o gato que comam');
    expect(eats(vp(COMER, { aspect: 'resultative' }))).toBe('o gato que tenha comido');
    expect(eats(vp(COMER), {})).toBe('o gato que come');
    expect(withRelative('o rato', np(RATO, { definiteness: 'no' }, {
      relative: { headRole: 'directObject', subject: el(np(GATO)), verbPhrase: vp(COMER) },
    }))).toBe('o rato que o gato coma');
  });
});
