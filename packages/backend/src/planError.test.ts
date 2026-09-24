import { describe, expect, test } from 'vitest';
import { planError } from './planError.js';

const cry = { verbPhrase: { verb: 'CRY' } };
const main = { subject: { concept: 'MAN' }, verbPhrase: { verb: 'RUN' } };

describe('planError', () => {
  test('passes a well-formed plan, its linked clauses each with a subject', () => {
    const catCries = { subject: { concept: 'CAT' }, ...cry };
    expect(planError(main)).toBeUndefined();
    expect(planError({ ...main, condition: catCries, coordination: { conjunction: 'and', clause: catCries } })).toBeUndefined();
    expect(planError({ ...main, contentObject: catCries, contentSubject: catCries, adverbialClause: { conjunction: 'when', clause: catCries } })).toBeUndefined();
  });

  test('names the top clause\'s missing subject', () => {
    expect(planError(undefined)).toBe('plan.subject.concept is required');
    expect(planError(cry)).toBe('plan.subject.concept is required');
    expect(planError({ subject: { conjuncts: [], conjunction: 'and' } })).toBe('plan.subject.concept is required');
  });

  // A267
  test.each([
    ['plan.condition', { ...main, condition: cry }],
    ['plan.contentObject', { ...main, contentObject: cry }],
    ['plan.contentSubject', { ...main, contentSubject: cry }],
    ['plan.coordination.clause', { ...main, coordination: { conjunction: 'and', clause: cry } }],
    ['plan.adverbialClause.clause', { ...main, adverbialClause: { conjunction: 'when', clause: cry } }],
    ['plan.condition.contentObject', { ...main, condition: { ...main, contentObject: cry } }],
    ['plan.coordination.clause.adverbialClause.clause', { ...main, coordination: { conjunction: 'and', clause: { ...main, adverbialClause: { conjunction: 'when', clause: cry } } } }],
  ])('names the missing subject of %s by its path', (path, plan) => {
    expect(planError(plan)).toBe(`${path}.subject.concept is required`);
  });

  test('a command\'s coordinate takes its addressee, so needs no subject of its own', () => {
    const command = { subject: { concept: 'SECOND_PERSON' }, verbPhrase: { verb: 'EAT' }, imperative: true };
    expect(planError({ ...command, coordination: { conjunction: 'and', clause: cry } })).toBeUndefined();
    expect(planError({ ...command, coordination: { conjunction: 'and', clause: { ...cry, condition: cry } } }))
      .toBe('plan.coordination.clause.condition.subject.concept is required');
    // A condition outranks the command (the pair is a conditional), so its coordinate is a statement's.
    expect(planError({ ...command, condition: { ...main }, coordination: { conjunction: 'and', clause: cry } }))
      .toBe('plan.coordination.clause.subject.concept is required');
  });

  test('a purpose clause and an infinitive complement need no subject: theirs is their controller\'s', () => {
    expect(planError({ ...main, purpose: cry, infinitiveComplement: cry })).toBeUndefined();
  });
});

// A273
describe('planError: a relative clause with no verb phrase', () => {
  const cat = (relative: object) => ({ concept: 'CAT', relative });
  test.each([
    ['plan.subject', { ...main, subject: cat({}) }],
    ['plan.directObject', { ...main, directObject: cat({ headRole: 'directObject', subject: { concept: 'DOG' } }) }],
    ['plan.complements.locative.phrase', { ...main, complements: { locative: { phrase: cat({ verbPhrase: {} }) } } }],
    ['plan.subject.possessor', { ...main, subject: { concept: 'DOG', possessor: cat({}) } }],
    ['plan.subject.conjuncts[1]', { ...main, subject: { conjunction: 'and', conjuncts: [{ concept: 'DOG' }, cat({})] } }],
    ['plan.subject.relative.directObject', { ...main, subject: cat({ verbPhrase: { verb: 'SEE' }, directObject: cat({}) }) }],
    ['plan.condition.subject', { ...main, condition: { ...main, subject: cat({}) } }],
    ['plan.purpose.directObject', { ...main, purpose: { verbPhrase: { verb: 'SEE' }, directObject: cat({}) } }],
  ])('names the relative clause on %s by its path', (path, plan) => {
    expect(planError(plan)).toBe(`${path}.relative.verbPhrase.verb is required`);
  });

  // A275
  test.each(['directObject', 'locative', 'possessor'])('names the missing subject of a relative clause whose head is its %s', (headRole) => {
    const eats = { headRole, verbPhrase: { verb: 'EAT' } };
    expect(planError({ ...main, subject: cat(eats) })).toBe('plan.subject.relative.subject.concept is required');
    expect(planError({ ...main, directObject: cat({ ...eats, subject: {} }) })).toBe('plan.directObject.relative.subject.concept is required');
    expect(planError({ ...main, directObject: cat({ ...eats, subject: { concept: 'DOG' } }) })).toBeUndefined();
  });

  // A288
  test('names a relative clause whose head is its role, wherever it hangs', () => {
    const actsAs = { headRole: 'role', subject: { concept: 'MAN' }, verbPhrase: { verb: 'ACT' } };
    expect(planError({ ...main, directObject: cat(actsAs) })).toBe('plan.directObject.relative.headRole: a relative clause cannot gap a role');
    expect(planError({ ...main, subject: cat(actsAs) })).toBe('plan.subject.relative.headRole: a relative clause cannot gap a role');
    expect(planError({ ...main, subject: cat({ ...actsAs, headRole: 'comitative' }) })).toBeUndefined();
  });

  test('passes a relative clause with its verb phrase', () => {
    expect(planError({ ...main, subject: cat({ verbPhrase: { verb: 'EAT' } }) })).toBeUndefined();
    expect(planError({ ...main, directObject: cat({ headRole: 'directObject', subject: { concept: 'DOG' }, verbPhrase: { verb: 'EAT' } }) })).toBeUndefined();
  });
});

// P11-E2
describe('planError: a coreferent possessor inside the subject it points at', () => {
  const link = { kind: 'coreferent', slot: 'subject' };
  test.each([
    ['plan.subject', { ...main, subject: { concept: 'BOOK', possessor: link } }],
    ['plan.subject.possessor', { ...main, subject: { concept: 'BOOK', possessor: { concept: 'MOTHER', possessor: link } } }],
    ['plan.subject.conjuncts[1]', { ...main, subject: { conjunction: 'and', conjuncts: [{ concept: 'DOG' }, { concept: 'BOOK', possessor: link }] } }],
    ['plan.condition.subject', { ...main, condition: { ...main, subject: { concept: 'BOOK', possessor: link } } }],
    ['plan.directObject.relative.subject', { ...main, directObject: { concept: 'CAT', relative: { headRole: 'directObject', verbPhrase: { verb: 'SEE' }, subject: { concept: 'DOG', possessor: link } } } }],
  ])('names the link in %s by its path', (path, plan) => {
    expect(planError(plan)).toBe(`${path}.possessor: a coreferent possessor cannot stand in the subject it points at`);
  });

  test('passes a link in the object, and one in a relative clause the subject holds', () => {
    expect(planError({ ...main, directObject: { concept: 'BOOK', possessor: link } })).toBeUndefined();
    expect(planError({ ...main, subject: { concept: 'MAN', relative: { verbPhrase: { verb: 'SEE' }, directObject: { concept: 'BOOK', possessor: link } } } })).toBeUndefined();
  });
});
