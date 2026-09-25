import { describe, expect, it } from 'vitest';
import type { Concept, PhrasePlan } from '@signi/shared';
import { planToWorkspace } from '@signi/phrase/model/workspacePlan/functions/planToWorkspace.ts';
import { workspaceToPlans } from '../../src/components/PhraseBuilder/workspacePlan/functions/workspaceToPlans.ts';

// The complements that came off the plan-only list and into a box (P09-E44): a plan that holds one
// fills its box, with nothing reported unsupported, and the box gives the same plan back.
const CONCEPTS: Record<string, Concept> = {
  MAN: { id: 'MAN', role: 'noun', description: 'man', animate: true, human: true },
  FRIEND: { id: 'FRIEND', role: 'noun', description: 'friend', gendered: true, animate: true, human: true },
  ACT: {
    id: 'ACT',
    role: 'verb',
    description: 'act',
    transitivity: 'intransitive',
    complements: ['manner', 'role', 'locative', 'cause', 'instrumental'],
  },
};
const conceptOf = (id: string) => CONCEPTS[id];

describe('a plan’s complement fills its box', () => {
  it('fills the role box — “the woman acts as a friend” — and gives the plan back', () => {
    const plan: PhrasePlan = {
      subject: { concept: 'MAN', definiteness: 'definite' },
      verbPhrase: { verb: 'ACT' },
      complements: { role: { phrase: { concept: 'FRIEND', gender: 'fem', number: 'plural' } } },
    };

    const { containers, unsupported } = planToWorkspace(plan, conceptOf);

    expect(unsupported).toEqual([]);
    expect(containers[0].selection).toMatchObject({ role: CONCEPTS.FRIEND, roleGender: 'fem', roleNumber: 'plural' });
    expect(workspaceToPlans(containers, [])[0]?.plan.complements?.role?.phrase).toMatchObject({
      concept: 'FRIEND',
      gender: 'fem',
      number: 'plural',
    });
  });
});
