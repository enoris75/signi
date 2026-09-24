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

// A338: an address calls the hearer.
describe('planError: the address', () => {
  const run = { subject: { concept: 'SECOND_PERSON' }, verbPhrase: { verb: 'RUN' }, imperative: true };
  const FORMS: Record<string, Record<string, string>> = {
    FIRST_PERSON: { person: '1' }, SECOND_PERSON: { person: '2' }, THIRD_PERSON: { person: '3' },
    SOMEONE: { person: '3', indefinite: '1' }, MOM: { base: 'Mom' },
  };
  const formsOf = (id: string) => FORMS[id];

  test('an instruction takes no address; a request does', () => {
    expect(planError({ ...run, imperativeRegister: 'instruction', address: { concept: 'MOM' } }))
      .toBe('plan.address: an instruction addresses nobody, so it takes no address');
    expect(planError({ ...run, imperativeRegister: 'request', address: { concept: 'MOM' } }, formsOf)).toBeUndefined();
  });

  test('a 1st- or 3rd-person pronoun is no address, by its path; the 2nd person and an indefinite are', () => {
    expect(planError({ ...main, address: { concept: 'FIRST_PERSON' } }, formsOf))
      .toBe('plan.address: an address calls the hearer, so it cannot be a 1st-person pronoun');
    expect(planError({ ...main, address: { conjuncts: [{ concept: 'MOM' }, { concept: 'THIRD_PERSON' }], conjunction: 'and' } }, formsOf))
      .toBe('plan.address.conjuncts[1]: an address calls the hearer, so it cannot be a 3rd-person pronoun');
    expect(planError({ ...run, address: { concept: 'SECOND_PERSON' } }, formsOf)).toBeUndefined();
    expect(planError({ ...run, address: { concept: 'SOMEONE' } }, formsOf)).toBeUndefined();
    // Without the lexicon the pronoun check is skipped.
    expect(planError({ ...main, address: { concept: 'FIRST_PERSON' } })).toBeUndefined();
  });
});

// A354: the generic person has no object form, so it is never a direct object.
describe('planError: the generic person as a direct object', () => {
  const G = { concept: 'GENERIC_PERSON' };
  const sees = { subject: { concept: 'CAT' }, verbPhrase: { verb: 'SEE' } };
  const FORMS: Record<string, Record<string, string>> = { TELL: { complements: 'terminus' }, SEE: {} };
  const formsOf = (id: string) => FORMS[id];
  const refused = (path: string) => `${path}.directObject: the generic person (GENERIC_PERSON) cannot be a direct object`;

  test('refuses it by its path, as a conjunct and wherever an active object hangs', () => {
    expect(planError({ ...sees, directObject: G })).toBe(refused('plan'));
    expect(planError({ ...sees, directObject: { conjuncts: [{ concept: 'DOG' }, G], conjunction: 'and' } })).toBe(refused('plan'));
    expect(planError({ ...main, subject: { concept: 'DOG', relative: { verbPhrase: { verb: 'SEE' }, directObject: G } } }))
      .toBe(refused('plan.subject.relative'));
    expect(planError({ ...main, verbPhrase: { verb: 'SAY' }, contentObject: { ...sees, directObject: G } })).toBe(refused('plan.contentObject'));
    expect(planError({ ...main, infinitiveComplement: { verbPhrase: { verb: 'SEE' }, directObject: G } })).toBe(refused('plan.infinitiveComplement'));
    expect(planError({ ...main, purpose: { verbPhrase: { verb: 'SEE' }, directObject: G } })).toBe(refused('plan.purpose'));
  });

  test('passes the generic subject, a passive\'s patient, the generic dative, and an addressee the verb sends to the dative', () => {
    expect(planError({ ...sees, subject: G, directObject: { concept: 'CAT' } })).toBeUndefined();
    // The passive promotes the object to the subject, wherever the passive clause hangs.
    expect(planError({ ...sees, directObject: G, verbPhrase: { verb: 'SEE', voice: 'passive' } })).toBeUndefined();
    expect(planError({ ...main, subject: { concept: 'DOG', relative: { verbPhrase: { verb: 'SEE', voice: 'passive' }, directObject: G } } })).toBeUndefined();
    expect(planError({ ...main, verbPhrase: { verb: 'SAY' }, contentObject: { ...sees, verbPhrase: { verb: 'SEE', voice: 'passive' }, directObject: G } })).toBeUndefined();
    expect(planError({ ...main, verbPhrase: { verb: 'GIVE' }, directObject: { concept: 'BOOK' }, complements: { terminus: { phrase: G } } })).toBeUndefined();
    const tells = { ...sees, verbPhrase: { verb: 'TELL' }, directObject: G, contentObject: { subject: { concept: 'DOG' }, verbPhrase: { verb: 'RUN' } } };
    expect(planError(tells, formsOf)).toBeUndefined();
    expect(planError({ ...tells, verbPhrase: { verb: 'SEE' } }, formsOf)).toBe(refused('plan'));
  });
});

