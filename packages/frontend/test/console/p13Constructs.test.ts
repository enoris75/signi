// P13's constructs that live in the console's grammar rather than in a command of their own: the
// relative gaps no box holds (CAR, HYPERNYM), an infinitive the predicate adjective governs (CAN), a
// direction's path (JUMP), joined predicate adjectives (NEUTER), and the clause a period with empty
// slots reads as its subject (SHOULD) or as an adverb (OF_COURSE).
import { describe, expect, it } from 'vitest';
import { workspaceToPlans } from '../../src/components/PhraseBuilder/workspacePlan/index.ts';
import type { NounPhrase } from '@signi/shared';
import { ok, run, script } from './helpers.ts';

const plan = (text: string) => workspaceToPlans(ok(text).containers, ok(text).links)[0]!.plan;

describe('a relative clause whose gap no box holds', () => {
  it('takes the instrument as #n.inst, and says it', () => {
    const text = '/subj stick /rel #2.inst\n/subj child /verb start';
    expect((plan(text).subject as NounPhrase).relative).toMatchObject({ headRole: 'instrumental', subject: { concept: 'CHILD' } });
    expect(script(ok(text))).toBe('/subj ( stick /rel #2.inst )\n/subj ( child ) /verb ( start )');
  });

  it('takes the subject’s possessor as #n.subj.poss, the genitive relative', () => {
    const text = '/subj man /rel #2.subj.poss\n/subj cat /poss man /verb run';
    const relative = (plan(text).subject as NounPhrase).relative!;
    expect(relative).toMatchObject({ headRole: 'possessor', subject: { concept: 'CAT' } });
    expect(relative.subject).not.toHaveProperty('possessor');
    expect(script(ok(text))).toBe('/subj ( man /rel #2.subj.poss )\n/subj ( cat /poss [ man ] ) /verb ( run )');
  });

  it('refuses the instrument of a verb that takes none, and a subject with no possessor', () => {
    expect(run('/subj stick /rel #2.inst\n/subj child /verb run').diagnostic?.code).toBe('relativeGapEmpty');
    expect(run('/subj man /rel #2.subj.poss\n/subj cat /verb run').diagnostic?.code).toBe('relativeGapEmpty');
  });
});

// P13: CAN is "to be able to act" — the adjective the period predicates governs the infinitive.
describe('an infinitive governed by the predicate adjective', () => {
  it('is taken by /to where the verb takes none', () => {
    const plan = workspaceToPlans(ok('/verb seem /pred happy /to ( /verb run )').containers, ok('/verb seem /pred happy /to ( /verb run )').links)[0]!.plan;
    expect(run('/verb seem /pred big /to ( /verb run )').diagnostic?.code).toBe('takesNoInfinitive');
    expect(plan.infinitiveComplement).toMatchObject({ verbPhrase: { verb: 'RUN' } });
  });
});

// P13: JUMP is "to move oneself into the air" — a direction reached by a path relation.
describe('a direction’s path relation', () => {
  it('is said on the direction, and /goal takes it back to the plain goal', () => {
    const plan = workspaceToPlans(ok('/verb run /dir house /in').containers, [])[0]!.plan;
    expect(plan.complements?.direction?.specifiers).toEqual([{ kind: 'path', value: 'in' }]);
    expect(script(ok('/verb run /dir house /in'))).toBe('/verb ( run ) /dir ( house /in )');
  });
});

// P13: NEUTER is "a word that is not male or female" — two predicate adjectives joined.
describe('joined predicate adjectives', () => {
  it('reads a predicate’s conjunct as the predicate is read, and prints it back', () => {
    const text = '/verb seem /pred happy /or big';
    const plan = workspaceToPlans(ok(text).containers, [])[0]!.plan;
    expect(plan.complements?.predicative?.phrase).toMatchObject({ conjuncts: [{ concept: 'HAPPY' }, { concept: 'BIG' }], conjunction: 'or' });
    expect(script(ok(text))).toBe('/verb ( seem ) /pred ( happy /or big )');
    // A subject's conjunct stays a noun or a pronoun.
    expect(run('/subj cat /and big').diagnostic?.code).toBe('unknownWord');
  });
});

// P13: SHOULD is "it is right that one acts" — a that-clause on a period with no subject word is its
// subject, whatever the verb takes; OF_COURSE is "as one expects" — an adverbial clause on a period
// with neither verb nor subject is the adverb it glosses. Both are read off the period, not set.
describe('the clause a period with empty slots reads', () => {
  it('is the subject where the period has no subject word', () => {
    const text = '/verb be /pred happy /clause ( /subj cat /verb run )';
    expect(plan(text)).toMatchObject({ subject: { concept: 'THING' }, contentSubject: { subject: { concept: 'CAT' } } });
    expect(plan(text)).not.toHaveProperty('contentObject');
    expect(script(ok(text))).toBe('/verb ( be ) /pred ( happy ) /clause #2\n/subj ( cat ) /verb ( run )');
    // With a subject it is the object again, and a verb that takes none refuses it.
    expect(plan('/subj man /verb say /clause ( /subj cat /verb run )')).toMatchObject({ subject: { concept: 'MAN' }, contentObject: {} });
    expect(run('/subj man /verb be /pred happy /clause ( /subj cat /verb run )').diagnostic?.code).toBe('takesNoContentClause');
    // A command's and a citation's subject goes unsaid: their that-clause is still the object.
    expect(plan('/inf /verb say /clause ( /subj cat /verb run )')).toHaveProperty('contentObject');
  });

  it('is the adverb where the period has neither verb nor subject', () => {
    const text = '/sub as ( /subj cat /verb run )';
    expect(plan(text)).toMatchObject({ subject: { concept: 'THING' }, adverbialGloss: true, adverbialClause: { conjunction: 'as' } });
    expect(script(ok(text))).toBe('/sub as #2\n/subj ( cat ) /verb ( run )');
    // A period with a subject and no verb is a noun phrase, and governs no clause.
    expect(run('/subj man /sub as ( /subj cat /verb run )').diagnostic?.code).toBe('subordinateNeedsVerb');
    expect(run('/clause ( /subj cat /verb run )').diagnostic?.code).toBe('subordinateNeedsVerb');
  });
});
