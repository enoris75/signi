// P13: the gaps of a relative clause no box holds — the period's instrument ("an object with which
// one goes to a place", CAR) and its subject's possessor ("a word whose meaning includes …", HYPERNYM).
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
