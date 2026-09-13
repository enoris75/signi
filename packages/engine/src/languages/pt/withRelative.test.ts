import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../../types.js';
import {
  CAO, COMER, complement, complements, DAR, el, EU, type Forms, GATO, LIVRO, MENINO, nounModifier, np, PALAVRA, RATO, SE, VER, vp,
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
});
