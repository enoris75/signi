import { describe, expect, test } from 'vitest';
import type { CoreferentPossessor, NounPhrase } from '@signi/shared';
import type { ResolvedNounElement } from '../../types.js';
import { bindComplements, bindCoreferents, subjectBinding } from './bindCoreferents.js';

const link: CoreferentPossessor = { kind: 'coreferent', slot: 'subject' };
const element = (...forms: Record<string, string>[]): ResolvedNounElement => ({
  conjuncts: forms.map((f) => ({ head: { conceptId: 'X', forms: f }, adjectives: [], nounModifiers: [] })),
  agreement: forms.length === 1 ? forms[0] : { person: '3', number: 'plural', gender: 'masc' },
});

describe('subjectBinding', () => {
  test('takes the grammatical gender where the subject has one', () => {
    expect(subjectBinding(element({ gender: 'fem', number: 'singular', human: '1' }), { concept: 'WOMAN' }))
      .toEqual({ kind: 'pronominal', person: '3', number: 'singular', gender: 'fem', coreferent: 'subject', human: true });
  });

  test('without one, the stated gender, else neuter for a thing and nothing for a person', () => {
    expect(subjectBinding(element({ number: 'singular', human: '1' }), { concept: 'WOMAN', gender: 'fem' }).gender).toBe('fem');
    expect(subjectBinding(element({ number: 'singular', animate: '1' }), { concept: 'CAT' })).toMatchObject({ gender: 'neut', human: false });
    expect(subjectBinding(element({ number: 'singular', human: '1' }), { concept: 'MAN' })).not.toHaveProperty('gender');
  });

  test('a pronoun is a person unless it is the neuter, and a group is the plural it agrees as', () => {
    expect(subjectBinding(element({ person: '1', number: 'singular', gender: 'masc' }), { concept: 'FIRST_PERSON' }))
      .toMatchObject({ person: '1', human: true });
    expect(subjectBinding(element({ person: '3', number: 'singular', gender: 'neut' }), { concept: 'IT' }).human).toBe(false);
    expect(subjectBinding(element({ animate: '1' }, { human: '1' }), { conjuncts: [{ concept: 'CAT' }, { concept: 'MAN' }], conjunction: 'and' }))
      .toMatchObject({ number: 'plural', human: true });
  });
});

describe('bindCoreferents', () => {
  const bound = subjectBinding(element({ gender: 'masc', number: 'singular', animate: '1' }), { concept: 'CAT' });

  test('binds the link through a possessor chain and a standard, and leaves a relative clause alone', () => {
    const relative = { verbPhrase: { verb: 'SEE' }, directObject: { concept: 'BOOK', possessor: link } };
    const phrase: NounPhrase = {
      concept: 'BOOK',
      possessor: { concept: 'MOTHER', possessor: link },
      headStandard: { concept: 'HOUSE', possessor: link },
      relative,
    };
    const out = bindCoreferents(phrase, bound, 'directObject') as NounPhrase;
    expect((out.possessor as NounPhrase).possessor).toBe(bound);
    expect((out.headStandard as NounPhrase).possessor).toBe(bound);
    expect(out.relative).toBe(relative);
  });

  test('returns a phrase with no link as it is', () => {
    const phrase: NounPhrase = { concept: 'BOOK', possessor: { concept: 'CAT' } };
    expect(bindCoreferents(phrase, bound, 'directObject')).toBe(phrase);
  });

  test('refuses a link with nothing to bind it to, by the slot it stands in', () => {
    expect(() => bindCoreferents({ concept: 'BOOK', possessor: link }, undefined, 'subject'))
      .toThrow('a coreferent possessor points at the subject, so it cannot stand in the subject itself (P11-E2)');
    expect(() => bindComplements({ locative: { phrase: { concept: 'HOUSE', possessor: link } } }, undefined))
      .toThrow('a coreferent possessor needs a subject to refer to, and the locative has none (P11-E2)');
  });
});
