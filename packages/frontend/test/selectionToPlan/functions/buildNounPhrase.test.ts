import { describe, expect, it } from 'vitest';
import { buildNounPhrase } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/buildNounPhrase.ts';
import type { PhraseSelection } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { BIG, BOY, CAT, concept, DOG, EAT, HAPPY, HOUSE, I, SAIL, WE } from '../fixtures.ts';
import { buildNounElement } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/buildNounElement.ts';

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

  // P09-E49: the flag's word is the quantity's own.
  it.each<[string, PhraseSelection, string | undefined]>([
    ['about on a numeral', { subject: CAT, numerals: { subject: 5 }, approximators: { subject: true } }, 'about'],
    ['almost on all', { subject: CAT, subjectDefiniteness: 'all', approximators: { subject: true } }, 'almost'],
    ['nothing unflagged', { subject: CAT, subjectDefiniteness: 'all' }, undefined],
  ])('writes the approximator: %s', (_, sel, want) => {
    expect(buildNounPhrase(sel, 'subject')?.approximator).toBe(want);
  });

  // P09-E50 D1: a noun's standard goes to its compared adjective, by index among real adjectives.
  it('places a noun’s standard on its first compared adjective, past a noun modifier', () => {
    const sel: PhraseSelection = {
      directObject: CAT,
      directObjectAdjective: SAIL,
      directObjectAdjective2: HAPPY,
      directObjectAdjective3: BIG,
      adjectiveDegrees: { directObjectAdjective2: 'positive', directObjectAdjective3: 'more' },
      directObjectStandard: { subject: DOG },
    };
    expect(buildNounPhrase(sel, 'directObject')).toMatchObject({
      adjectives: ['HAPPY', 'BIG'],
      adjectiveStandards: [undefined, { concept: 'DOG' }],
      headStandard: undefined,
    });
    // Two compared adjectives: the first gets it.
    const two = { ...sel, adjectiveDegrees: { directObjectAdjective2: 'less', directObjectAdjective3: 'more' } } as PhraseSelection;
    expect(buildNounPhrase(two, 'directObject')?.adjectiveStandards).toMatchObject([{ concept: 'DOG' }]);
    // None compares: kept in the selection, left out of the plan; a superlative is no rival.
    expect(buildNounPhrase({ ...sel, adjectiveDegrees: {} }, 'directObject')?.adjectiveStandards).toBeUndefined();
    expect(buildNounPhrase({ ...sel, adjectiveDegrees: { directObjectAdjective3: 'most' } }, 'directObject')?.adjectiveStandards).toBeUndefined();
    // An empty standard is none.
    expect(buildNounPhrase({ ...sel, directObjectStandard: {} }, 'directObject')?.adjectiveStandards).toBeUndefined();
  });

  // P09-E48: a noun's examples, under either relation; none on an empty ring or an adjective head.
  it('gives a noun head its examples, such as or including', () => {
    const sel: PhraseSelection = { subject: HOUSE, subjectNumber: 'plural', subjectExamples: { subject: DOG } };
    expect(buildNounPhrase(sel, 'subject')?.examples).toMatchObject({ phrase: { concept: 'DOG' }, relation: 'example' });
    expect(buildNounPhrase({ ...sel, exampleRelations: { subject: 'inclusion' } }, 'subject')?.examples).toMatchObject({ relation: 'inclusion' });
    expect(buildNounPhrase({ ...sel, subjectExamples: {} }, 'subject')?.examples).toBeUndefined();
    expect(buildNounPhrase({ predicative: BIG, predicativeExamples: { subject: DOG } }, 'predicative')?.examples).toBeUndefined();
  });

  it('keeps an adjective head’s standard as its headStandard', () => {
    const sel: PhraseSelection = { predicative: BIG, adjectiveDegrees: { predicative: 'more' }, predicativeStandard: { subject: DOG } };
    expect(buildNounPhrase(sel, 'predicative')).toMatchObject({ headStandard: { concept: 'DOG' }, adjectiveStandards: undefined });
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

  // P11-E7 D1: the pointer at the clause's subject is the link, not a copy of the subject's features.
  it('writes a pointer at the clause’s subject as the link to it', () => {
    const sel: PhraseSelection = {
      subject: BOY,
      subjectGender: 'masc',
      verb: EAT,
      directObject: DOG,
      directObjectPossessorRef: 'subject',
    };

    expect(buildNounPhrase(sel, 'directObject')?.possessor).toEqual({ kind: 'coreferent', slot: 'subject' });
  });

  it('resolves a pointer at another noun to its antecedent’s features', () => {
    const sel: PhraseSelection = {
      subject: BOY,
      verb: EAT,
      directObject: DOG,
      directObjectGender: 'masc',
      locative: HOUSE,
      locativePossessorRef: 'directObject',
    };

    expect(buildNounPhrase(sel, 'locative')?.possessor).toEqual({
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
      verb: EAT,
      directObject: HOUSE,
      directObjectPossessor: { subject: DOG, subjectPossessorRef: 'subject' },
    };

    const possessor = buildNounPhrase(sel, 'directObject')?.possessor;

    expect(possessor).toMatchObject({ concept: 'DOG', possessor: { kind: 'coreferent', slot: 'subject' } });
  });

  // P11-E7 D3: where the builder keeps the copy.
  describe('the link to the subject, and where the copy stays', () => {
    const LINK = { kind: 'coreferent', slot: 'subject' };
    const base: PhraseSelection = { subject: BOY, subjectNumber: 'plural', verb: EAT };
    const possessorOf = (sel: PhraseSelection, which: 'subject' | 'directObject' | 'locative' = 'directObject') =>
      buildNounPhrase(sel, which)?.possessor;

    it.each<[string, PhraseSelection, 'directObject' | 'locative', (p: unknown) => unknown]>([
      ['the object', { ...base, directObject: DOG, directObjectPossessorRef: 'subject' }, 'directObject', (p) => p],
      ['a complement', { ...base, locative: HOUSE, locativePossessorRef: 'subject' }, 'locative', (p) => p],
      ['an owner’s owner', { ...base, directObject: HOUSE, directObjectPossessor: { subject: DOG, subjectPossessor: { subject: CAT, subjectPossessorRef: 'subject' } } }, 'directObject',
        (p) => ((p as { possessor: { possessor: unknown } }).possessor).possessor],
      ['a standard', { ...base, directObject: DOG, directObjectAdjective: BIG, adjectiveDegrees: { directObjectAdjective: 'more' }, directObjectStandard: { subject: CAT, subjectPossessorRef: 'subject' } }, 'directObject',
        (p) => p],
    ])('links from %s', (_, sel, which, at) => {
      const np = buildNounPhrase(sel, which)!;
      if (_ === 'a standard') expect((np.adjectiveStandards?.[0] as { possessor?: unknown }).possessor).toEqual(LINK);
      else expect(at(np.possessor)).toEqual(LINK);
    });

    it('copies inside the subject’s own subtree: a conjunct’s owner, the subject’s owner’s owner', () => {
      const conjunct: PhraseSelection = { ...base, subjectConjuncts: [{ subject: CAT, subjectPossessorRef: 'subject' }] };
      expect(buildNounElement(conjunct, 'subject')).toMatchObject({
        conjuncts: [{ concept: 'BOY' }, { concept: 'CAT', possessor: { kind: 'pronominal', number: 'plural' } }],
      });
      const owners: PhraseSelection = { ...base, subjectPossessor: { subject: DOG, subjectPossessorRef: 'subject' } };
      expect(possessorOf(owners, 'subject')).toMatchObject({ possessor: { kind: 'pronominal' } });
    });

    it('copies a pointer at the subject’s owner, which is no subject', () => {
      const sel: PhraseSelection = { ...base, subjectPossessor: { subject: CAT }, directObject: DOG, directObjectPossessorRef: 'subject/possessor' };
      expect(possessorOf(sel)).toMatchObject({ kind: 'pronominal', person: '3' });
    });

    it('copies under the passive, and in a verbless period', () => {
      const pointer: PhraseSelection = { ...base, directObject: DOG, directObjectPossessorRef: 'subject' };
      expect(possessorOf({ ...pointer, verbVoice: 'passive' })).toMatchObject({ kind: 'pronominal', number: 'plural' });
      const { verb: _verb, ...verbless } = pointer;
      expect(possessorOf(verbless)).toMatchObject({ kind: 'pronominal', number: 'plural' });
    });

    // D4: under a command the subject pick is a stashed word the plan does not say.
    it('links under a command, and drops a pointer at the hidden subject the link cannot reach', () => {
      const command: PhraseSelection = { ...base, imperative: true, directObject: DOG, directObjectPossessorRef: 'subject' };
      expect(possessorOf(command)).toEqual(LINK);
      expect(possessorOf({ ...command, verbVoice: 'passive' })).toBeUndefined();
      expect(possessorOf({ ...command, infinitive: true, imperative: undefined })).toEqual(LINK);
    });
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

  // P11-E9 D2: a pronoun named in the owner's ring is a possessive pronoun, never a genitive ("the I's").
  describe('a pronoun named as the owner', () => {
    const THIRD = concept('THIRD_PERSON', 'pronoun', { person: '3' });
    const GENERIC = concept('GENERIC_PERSON', 'pronoun', { person: '3' });
    const SOMEONE = concept('SOMEONE', 'pronoun', { person: '3', slot: 'indefinite' });
    const owned = (owner: PhraseSelection, extra: PhraseSelection = {}) =>
      buildNounPhrase({ subject: HOUSE, subjectPossessor: owner, ...extra }, 'subject');

    it('writes the 1st person as a possessive pronoun, its gender left out', () => {
      expect(owned({ subject: I, subjectNumber: 'singular', subjectGender: 'fem' })?.possessor).toEqual({
        kind: 'pronominal',
        person: '1',
        number: 'singular',
      });
    });

    it('reads the number off the ring, else the pronoun’s own: our', () => {
      expect(owned({ subject: I, subjectNumber: 'plural' })?.possessor).toMatchObject({ person: '1', number: 'plural' });
      expect(owned({ subject: WE })?.possessor).toMatchObject({ person: '1', number: 'plural' });
    });

    it('keeps the 3rd person’s gender: her', () => {
      expect(owned({ subject: THIRD, subjectNumber: 'singular', subjectGender: 'fem' })?.possessor).toEqual({
        kind: 'pronominal',
        person: '3',
        number: 'singular',
        gender: 'fem',
      });
    });

    it('drops the generic and an indefinite, which have no possessive the plan can state', () => {
      expect(owned({ subject: GENERIC })?.possessor).toBeUndefined();
      expect(owned({ subject: SOMEONE })?.possessor).toBeUndefined();
    });

    it('does not write what the owner’s slice still holds: its owner, adjective or conjuncts', () => {
      const possessor = owned({
        subject: I,
        subjectAdjective: BIG,
        subjectPossessor: { subject: DOG },
        subjectConjuncts: [{ subject: CAT }],
      })?.possessor;
      expect(possessor).toEqual({ kind: 'pronominal', person: '1', number: 'singular' });
    });

    it('drops a role under a pronoun owner, and gives it back under a noun owner (D5)', () => {
      const roles = { possessorRoles: { subject: 'whole' as const } };
      expect(owned({ subject: I }, roles)?.possessorRole).toBeUndefined();
      expect(owned({ subject: BOY }, roles)?.possessorRole).toBe('whole');
    });
  });

  it('drops a reference whose antecedent is gone', () => {
    const sel: PhraseSelection = { directObject: DOG, directObjectPossessorRef: 'subject' };

    expect(buildNounPhrase(sel, 'directObject')?.possessor).toBeUndefined();
  });
});
