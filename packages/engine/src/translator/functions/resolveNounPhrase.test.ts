import { describe, expect, test } from 'vitest';
import type { NounPhrase, PronominalPossessor } from '@signi/shared';
import { ACQUA, CASA, GATTO, GRANDE, IO, lexicon, LOOKUP, LUI, ROSSO, type Forms } from '../translator.fixtures.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolveNounPhrase } from './resolveNounPhrase.js';

const resolveIt = (np: NounPhrase, lookup: LexiconLookup = LOOKUP) => resolveNounPhrase(np, 'it', lookup);
const headForms = (np: NounPhrase, lookup?: LexiconLookup) => resolveIt(np, lookup).head.forms;
const only = (conceptId: string, forms: Forms) => lexicon({ [conceptId]: forms });

describe('resolveNounPhrase', () => {
  describe('a noun head', () => {
    test('is definite and singular unless the plan picks otherwise, with nothing attached', () => {
      expect(resolveIt({ concept: 'CAT' })).toEqual({
        head: { conceptId: 'CAT', forms: { ...GATTO, number: 'singular', definiteness: 'definite' } },
        adjectives: [],
        nounModifiers: [],
        relative: undefined,
        possessor: undefined,
        dimensionGloss: undefined,
        mannerGloss: undefined,
      });
    });

    test('keeps the chosen number and determiner', () => {
      expect(headForms({ concept: 'CAT', number: 'plural', definiteness: 'indefinite' }))
        .toMatchObject({ number: 'plural', definiteness: 'indefinite' });
    });

    test('a plural with no plural surface stays singular', () => {
      expect(headForms({ concept: 'WATER', number: 'plural' })['number']).toBe('singular');
    });

    test.each(['some', 'many', 'few', 'all'] as const)('%s forces the plural surface', (definiteness) => {
      expect(headForms({ concept: 'CAT', definiteness })['number']).toBe('plural');
    });

    test('a quantifier leaves a mass noun singular, and any other determiner keeps the chosen number', () => {
      expect(headForms({ concept: 'WATER', definiteness: 'some' })).toEqual({ ...ACQUA, number: 'singular', definiteness: 'some' });
      expect(headForms({ concept: 'CAT', definiteness: 'this' })['number']).toBe('singular');
    });

    test('a feminine referent takes the feminine forms', () => {
      expect(headForms({ concept: 'CAT', number: 'plural', gender: 'fem' })).toMatchObject({ base: 'gatte', gender: 'fem' });
    });
  });

  describe('a pronoun head', () => {
    test("a 1st-person singular keeps its base, carrying number and the referent's gender, but no determiner", () => {
      expect(headForms({ concept: 'I', gender: 'fem', definiteness: 'indefinite' }))
        .toEqual({ ...IO, number: 'singular', gender: 'fem' });
    });

    test('defaults to the masculine singular', () => {
      expect(headForms({ concept: 'I' })).toMatchObject({ number: 'singular', gender: 'masc' });
    });

    test('a plural takes the plural surface and the plural oblique', () => {
      expect(headForms({ concept: 'I', number: 'plural' })).toMatchObject({ base: 'noi', plural: 'noi', disjunctive: 'noi' });
    });

    test('a feminine plural takes its own surface where the language has one', () => {
      const ils = only('THEY', { base: 'il', person: '3', singular_fem: 'elle', plural: 'ils', plural_fem: 'elles' });
      expect(headForms({ concept: 'THEY', number: 'plural', gender: 'fem' }, ils)).toMatchObject({ base: 'elles', plural: 'elles' });
      expect(headForms({ concept: 'THEY', number: 'plural', gender: 'masc' }, ils)).toMatchObject({ base: 'ils', plural: 'ils' });
      expect(headForms({ concept: 'HE', number: 'plural', gender: 'fem' })).toMatchObject({ base: 'loro', plural: 'loro' });
    });

    test('a 3rd-person singular takes the surface of its gender, when there is one', () => {
      expect(headForms({ concept: 'HE', gender: 'fem' })).toMatchObject({ base: 'lei', disjunctive: 'lei' });
      expect(headForms({ concept: 'HE', gender: 'masc' })).toMatchObject({ base: 'lui', disjunctive: 'lui' });
    });

    test('the furigana reading follows the surface it goes with', () => {
      const kare = only('HE', {
        base: '彼', reading: 'かれ', person: '3',
        singular_fem: '彼女', singular_fem_reading: 'かのじょ', plural: '彼ら', plural_reading: 'かれら',
      });
      expect(headForms({ concept: 'HE', number: 'plural' }, kare)).toMatchObject({ base: '彼ら', reading: 'かれら' });
      expect(headForms({ concept: 'HE', gender: 'fem' }, kare)).toMatchObject({ base: '彼女', reading: 'かのじょ' });
      expect(headForms({ concept: 'HE', gender: 'masc' }, kare)).toMatchObject({ base: '彼', reading: 'かれ' });
    });

    test('a missing plural surface, or plural oblique, falls back to what the pronoun has', () => {
      const si = only('SELF', { base: 'sé', person: '3', disjunctive: 'sé' });
      expect(headForms({ concept: 'SELF', number: 'plural' }, si)).toEqual({ base: 'sé', person: '3', disjunctive: 'sé', number: 'plural', gender: 'masc' });
    });

    test('a pronoun with no oblique form gets none', () => {
      const ci = only('THERE', { base: 'ci', person: '3' });
      expect(headForms({ concept: 'THERE' }, ci)).not.toHaveProperty('disjunctive');
    });
  });

  describe('the head degree', () => {
    test('an adjective head carries its comparative degree', () => {
      expect(headForms({ concept: 'HAPPY', headDegree: 'more' })['degree']).toBe('more');
    });

    test('the positive degree, or no degree, or a noun head, carries none', () => {
      expect(headForms({ concept: 'HAPPY', headDegree: 'positive' })).not.toHaveProperty('degree');
      expect(headForms({ concept: 'HAPPY' })).not.toHaveProperty('degree');
      expect(headForms({ concept: 'CAT', headDegree: 'more' })).not.toHaveProperty('degree');
    });
  });

  describe('what hangs off the head', () => {
    test('adjectives resolve in order, each carrying its own degree unless positive', () => {
      expect(resolveIt({ concept: 'CAT', adjectives: ['BIG', 'RED', 'BIG'], adjectiveDegrees: ['most', 'positive'] }).adjectives).toEqual([
        { conceptId: 'BIG', forms: { ...GRANDE, degree: 'most' } },
        { conceptId: 'RED', forms: ROSSO },
        { conceptId: 'BIG', forms: GRANDE },
      ]);
    });

    test('attributive nouns carry their relation, their own number, and their own adjectives', () => {
      const { nounModifiers } = resolveIt({
        concept: 'CAT',
        nounModifiers: [
          { concept: 'HOUSE', relation: 'feature', number: 'plural', adjectives: ['RED'] },
          { concept: 'WATER', relation: 'material', number: 'plural' },
          { concept: 'HOUSE', relation: 'purpose' },
        ],
      });
      expect(nounModifiers).toEqual([
        { concept: { conceptId: 'HOUSE', forms: { ...CASA, number: 'plural' } }, relation: 'feature', adjectives: [{ conceptId: 'RED', forms: ROSSO }] },
        { concept: { conceptId: 'WATER', forms: { ...ACQUA, number: 'singular' } }, relation: 'material', adjectives: [] },
        { concept: { conceptId: 'HOUSE', forms: { ...CASA, number: 'singular' } }, relation: 'purpose', adjectives: [] },
      ]);
    });

    test('a relative clause resolves with the head in its subject slot by default', () => {
      const { relative } = resolveIt({ concept: 'CAT', relative: { verbPhrase: { verb: 'RUN' } } });
      expect(relative?.headRole).toBe('subject');
      expect(relative?.verbPhrase.verb.conceptId).toBe('RUN');
    });

    test('a pronominal possessor passes straight through', () => {
      const mine: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'singular' };
      expect(resolveIt({ concept: 'HOUSE', possessor: mine }).possessor).toBe(mine);
    });

    test('a genitive possessor resolves as a noun phrase of its own, to any depth', () => {
      const { possessor } = resolveIt({ concept: 'HOUSE', possessor: { concept: 'CAT', gender: 'fem', possessor: { concept: 'HE' } } });
      expect(possessor).toMatchObject({
        head: { conceptId: 'CAT', forms: { base: 'gatta', definiteness: 'definite' } },
        possessor: { head: { conceptId: 'HE', forms: { base: 'lui', number: 'singular' } } },
      });
    });

    test('the gloss flags ride through', () => {
      expect(resolveIt({ concept: 'SPEED', dimensionGloss: true, mannerGloss: true })).toMatchObject({ dimensionGloss: true, mannerGloss: true });
    });
  });
});
