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
