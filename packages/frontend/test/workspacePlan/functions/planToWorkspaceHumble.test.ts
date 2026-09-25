import { describe, expect, it } from 'vitest';
import type { Concept, PhrasePlan } from '@signi/shared';
import { planToWorkspace } from '@signi/phrase/model/workspacePlan/functions/planToWorkspace.ts';
import { workspaceToPlans } from '../../../src/components/PhraseBuilder/workspacePlan/functions/workspaceToPlans.ts';

const WORDS = new Map<string, Concept>([
  ['FIRST_PERSON', { id: 'FIRST_PERSON', role: 'pronoun', description: 'I', person: '1' }],
  ['CAT', { id: 'CAT', role: 'noun', description: 'cat' }],
  ['EAT', { id: 'EAT', role: 'verb', description: 'eat', transitivity: 'transitive', humble: true }],
]);
const conceptOf = (id: string) => WORDS.get(id);

// P11-E6: the humble register is a verb phrase field the canvas holds (`verbHumble`), so a plan that
// sets it comes back whole where the subject takes it, and is held, unsaid, where it does not.
describe('planToWorkspace: the humble register', () => {
  it('holds a humble verb phrase and gives it back', () => {
    const plan: PhrasePlan = { subject: { concept: 'FIRST_PERSON' }, verbPhrase: { verb: 'EAT', humble: true } };
    const { containers, links, unsupported } = planToWorkspace(plan, conceptOf);

    expect(unsupported).toEqual([]);
    expect(containers[0]!.selection.verbHumble).toBe(true);
    expect(workspaceToPlans(containers, links)[0]!.plan.verbPhrase).toMatchObject({ verb: 'EAT', humble: true });
  });

  it('keeps the flag under a subject that does not take it, and leaves it out of the plan', () => {
    const plan: PhrasePlan = { subject: { concept: 'CAT' }, verbPhrase: { verb: 'EAT', humble: true } };
    const { containers, links, unsupported } = planToWorkspace(plan, conceptOf);

    expect(unsupported).toEqual([]);
    expect(containers[0]!.selection.verbHumble).toBe(true);
    expect(workspaceToPlans(containers, links)[0]!.plan.verbPhrase).not.toHaveProperty('humble');
  });
});
