import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../types.js';
import { complement, complements, concept, el, group, modal, np, vp } from '../languages/resolved.fixtures.js';
import { relativeInvertsCopula } from './relativeInvertsCopula.js';

const CAT = { base: 'cat', number: 'singular' };
const DOG = { base: 'dog', number: 'singular' };
const I = { base: 'I', person: '1', number: 'singular' };
const ONE = { base: 'one', person: '3', number: 'singular', generic: '1' };
const BE = { base: 'be' };
const EAT = { base: 'eat' };
const HAPPY = { base: 'happy' };

const where = (rest: Partial<ResolvedRelativeClause> = {}): ResolvedRelativeClause =>
  ({ headRole: 'locative', subject: el(np(DOG)), verbPhrase: vp(BE, {}, 'BE'), ...rest });

describe('relativeInvertsCopula', () => {
  // A221: "dov'è il gatto", "où est le chat", "sotto la quale è il gatto".
  test('the bare copula after a noun subject, gapped on a complement, inverts', () => {
    expect(relativeInvertsCopula(where())).toBe(true);
    expect(relativeInvertsCopula(where({ headSpecifiers: [{ kind: 'path', value: 'under' }] }))).toBe(true);
    expect(relativeInvertsCopula(where({ headRole: 'comitative' }))).toBe(true);
    expect(relativeInvertsCopula(where({ verbPhrase: vp(BE, { tense: 'past' }, 'BE') }))).toBe(true);
    expect(relativeInvertsCopula(where({ verbPhrase: vp(BE, { tense: 'future' }, 'BE') }))).toBe(true);
    expect(relativeInvertsCopula(where({ subject: group('and', np(DOG), np(DOG)) }))).toBe(true);
  });

  test('another verb, a complement, an object, an adverb or a pro-form is no bare copula', () => {
    expect(relativeInvertsCopula(where({ verbPhrase: vp(EAT, {}, 'EAT') }))).toBe(false);
    expect(relativeInvertsCopula(where({ complements: complements({ predicative: complement(np(HAPPY)) }) }))).toBe(false);
    expect(relativeInvertsCopula(where({ directObject: el(np(CAT)) }))).toBe(false);
    expect(relativeInvertsCopula(where({ verbPhrase: vp(BE, { modifier: concept({ base: 'always' }) }, 'BE') }))).toBe(false);
    expect(relativeInvertsCopula(where({ verbPhrase: vp(BE, { elided: { type: 'predicative', complement: complement(np(HAPPY)) } }, 'BE') }))).toBe(false);
  });

  // As ruled: the negative, the compound tenses and a modal keep the statement's order.
  test('a negative, a marked aspect or a modal keeps SV', () => {
    expect(relativeInvertsCopula(where({ verbPhrase: vp(BE, { negative: true }, 'BE') }))).toBe(false);
    expect(relativeInvertsCopula(where({ subject: el(np(DOG, { definiteness: 'no' })) }))).toBe(false);
    expect(relativeInvertsCopula(where({ verbPhrase: vp(BE, { aspect: 'resultative' }, 'BE') }))).toBe(false);
    expect(relativeInvertsCopula(where({ verbPhrase: vp(BE, { modals: [modal({ base: 'must' })] }, 'BE') }))).toBe(false);
  });

  test('a pronoun, a group holding one, or the generic subject keeps SV', () => {
    expect(relativeInvertsCopula(where({ subject: el(np(I)) }))).toBe(false);
    expect(relativeInvertsCopula(where({ subject: group('and', np(DOG), np(I)) }))).toBe(false);
    expect(relativeInvertsCopula(where({ subject: el(np(ONE)) }))).toBe(false);
  });

  // A predicative gap relativises with "che" / "que"; inverting it would read as a subject relative.
  test('a gap that is no complement never inverts', () => {
    for (const headRole of ['subject', 'directObject', 'possessor', 'agent', 'predicative', 'objectPredicative'] as const) {
      expect(relativeInvertsCopula(where({ headRole }))).toBe(false);
    }
    expect(relativeInvertsCopula(where({ subject: undefined }))).toBe(false);
  });
});
