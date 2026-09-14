import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../../types.js';
import {
  CAO, CASA, COMER, complement, complements, DAR, el, EU, type Forms, GATO, LIVRO, MENINO, MULHER, nounModifier, np, PALAVRA, RATO, SE, VER, vp,
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
    expect(withRelative('o livro', np(LIVRO, {}, { relative: iSee }))).toBe('o livro que eu vejo');
    const catsAte: ResolvedRelativeClause = { headRole: 'directObject', subject: el(np(GATO, { number: 'plural' })), verbPhrase: vp(COMER, { tense: 'past' }) };
    expect(withRelative('o rato', np(RATO, {}, { relative: catsAte }))).toBe('o rato que os gatos comeram');
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
});
