import { describe, expect, it } from 'vitest';
import { buildNounPhrase } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/buildNounPhrase.ts';
import type { PhraseSelection } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { BIG, BOY, CAT, DOG, HAPPY, HOUSE, SAIL } from '../fixtures.ts';

describe('buildNounPhrase', () => {
  it('is undefined for an empty slot', () => {
    expect(buildNounPhrase({ subject: CAT }, 'directObject')).toBeUndefined();
  });

  it('builds the head with its number, gender, determiner and modifiers', () => {
    const sel: PhraseSelection = {
      subject: CAT,
      subjectNumber: 'plural',
      subjectGender: 'fem',
      subjectDefiniteness: 'indefinite',
      subjectAdjective: BIG,
      subjectAdjective2: SAIL,
    };

    expect(buildNounPhrase(sel, 'subject')).toEqual({
      concept: 'CAT',
      headDegree: undefined,
      number: 'plural',
      gender: 'fem',
      definiteness: 'indefinite',
      adjectives: ['BIG'],
      adjectiveDegrees: ['positive'],
      nounModifiers: [{ concept: 'SAIL', relation: 'feature' }],
      possessor: undefined,
    });
  });

  it('reads the fields of the block it builds and no other', () => {
    const sel: PhraseSelection = { subject: CAT, subjectNumber: 'plural', locative: HOUSE, locativeGender: 'fem' };

    expect(buildNounPhrase(sel, 'locative')).toMatchObject({ concept: 'HOUSE', number: undefined, gender: 'fem' });
  });

  // P09-E12 D5: the standard rides with the degree that takes one; under the superlatives the
  // translator reads it as the set (P09-E19), which the canvas offers too (P09-E51 D1).
  it('gives an adjective head its standard of comparison on the degrees that take one', () => {
    const sel: PhraseSelection = {
      predicative: BIG,
      adjectiveDegrees: { predicative: 'more' },
      predicativeStandard: { subject: DOG, subjectDefiniteness: 'indefinite' },
    };

    expect(buildNounPhrase(sel, 'predicative')).toMatchObject({
      concept: 'BIG',
      headDegree: 'more',
      headStandard: { concept: 'DOG', definiteness: 'indefinite' },
    });
    expect(buildNounPhrase({ ...sel, adjectiveDegrees: { predicative: 'equally' } }, 'predicative')?.headStandard).toMatchObject({ concept: 'DOG' });
    expect(buildNounPhrase({ ...sel, adjectiveDegrees: { predicative: 'most' } }, 'predicative')?.headStandard).toMatchObject({ concept: 'DOG' });
    expect(buildNounPhrase({ ...sel, adjectiveDegrees: { predicative: 'least' } }, 'predicative')?.headStandard).toMatchObject({ concept: 'DOG' });
    expect(buildNounPhrase({ ...sel, adjectiveDegrees: { predicative: 'positive' } }, 'predicative')?.headStandard).toBeUndefined();
    expect(buildNounPhrase({ predicative: BIG }, 'predicative')?.headStandard).toBeUndefined();
  });

  it('gives an adjective head the degree stored under its own slot', () => {
    const sel: PhraseSelection = { predicative: HAPPY, adjectiveDegrees: { predicative: 'more' } };

    expect(buildNounPhrase(sel, 'predicative')?.headDegree).toBe('more');
  });

  it('gives a noun head no degree, whatever is stored under its slot', () => {
    const sel: PhraseSelection = { predicative: CAT, adjectiveDegrees: { predicative: 'more' } };

    expect(buildNounPhrase(sel, 'predicative')?.headDegree).toBeUndefined();
  });

  it('builds a genitive possessor from its own subject fields, nesting as deep as it goes', () => {
    const sel: PhraseSelection = {
      directObject: HOUSE,
      directObjectPossessor: {
        subject: BOY,
        subjectNumber: 'plural',
        subjectAdjective: BIG,
        subjectPossessor: { subject: DOG },
      },
    };

    expect(buildNounPhrase(sel, 'directObject')?.possessor).toMatchObject({
      concept: 'BOY',
      number: 'plural',
      adjectives: ['BIG'],
      possessor: { concept: 'DOG', possessor: undefined },
    });
  });

  it('resolves a pronominal possessor to its antecedent’s features', () => {
    const sel: PhraseSelection = {
      subject: BOY,
      subjectGender: 'masc',
      directObject: DOG,
      directObjectPossessorRef: 'subject',
    };

    expect(buildNounPhrase(sel, 'directObject')?.possessor).toEqual({
      kind: 'pronominal',
      person: '3',
      number: 'singular',
      gender: 'masc',
    });
  });

  it('resolves a nested possessor’s reference against the whole period', () => {
    // The possessor's own selection has a `subject` of its own, but the address names the period's.
    const sel: PhraseSelection = {
      subject: BOY,
      subjectNumber: 'plural',
      directObject: HOUSE,
      directObjectPossessor: { subject: DOG, subjectPossessorRef: 'subject' },
    };

    const possessor = buildNounPhrase(sel, 'directObject')?.possessor;

    expect(possessor).toMatchObject({ concept: 'DOG', possessor: { kind: 'pronominal', number: 'plural' } });
  });

  it('lets a pronominal reference win over a genitive possessor', () => {
    const sel: PhraseSelection = {
      subject: BOY,
      directObject: DOG,
      directObjectPossessorRef: 'subject',
      directObjectPossessor: { subject: CAT },
    };

    expect(buildNounPhrase(sel, 'directObject')?.possessor).toMatchObject({ kind: 'pronominal' });
  });

  it('drops a reference whose antecedent is gone', () => {
    const sel: PhraseSelection = { directObject: DOG, directObjectPossessorRef: 'subject' };

    expect(buildNounPhrase(sel, 'directObject')?.possessor).toBeUndefined();
  });
});
