import { describe, expect, it } from 'vitest';
import type { Concept, NounPhrase, PhrasePlan } from '@signi/shared';
import { planToWorkspace } from '@signi/phrase/model/workspacePlan/functions/planToWorkspace.ts';
import { workspaceToPlans } from '../../../src/components/PhraseBuilder/workspacePlan/functions/workspaceToPlans.ts';

const concept = (id: string, role: Concept['role']): Concept => ({ id, role, description: id, label: id });
const WORDS = new Map([concept('CAT', 'noun'), concept('RUN', 'verb')].map((c) => [c.id, c]));
const conceptOf = (id: string) => WORDS.get(id);

const run = (subject: NounPhrase): PhrasePlan => ({ subject, verbPhrase: { verb: 'RUN' } });

// P09-E49: an approximator on the canvas is a flag whose word the quantity decides, so a plan's comes
// back whole where it is the quantity's own, and is named unsaid where the engine would ignore it.
describe('planToWorkspace: the approximator', () => {
  it.each<[string, NounPhrase]>([
    ['about five cats', { concept: 'CAT', number: 'plural', numeral: 5, approximator: 'about' }],
    ['almost all cats', { concept: 'CAT', number: 'plural', definiteness: 'all', approximator: 'almost' }],
    ['almost no cat', { concept: 'CAT', definiteness: 'no', approximator: 'almost' }],
  ])('holds %s, and gives it back', (_, subject) => {
    const { containers, links, unsupported } = planToWorkspace(run(subject), conceptOf);

    expect(unsupported).toEqual([]);
    expect(containers[0]!.selection.approximators).toEqual({ subject: true });
    expect(workspaceToPlans(containers, links)[0]!.plan.subject).toMatchObject({ approximator: subject.approximator });
  });

  it.each<[string, NounPhrase]>([
    ['almost on a numeral', { concept: 'CAT', numeral: 5, approximator: 'almost' }],
    ['about with no numeral', { concept: 'CAT', definiteness: 'all', approximator: 'about' }],
    ['almost on some', { concept: 'CAT', definiteness: 'some', approximator: 'almost' }],
  ])('names %s as unsaid', (_, subject) => {
    const { containers, unsupported } = planToWorkspace(run(subject), conceptOf);

    expect(unsupported).toEqual(['NounPhrase.approximator off its quantity']);
    expect(containers[0]!.selection).not.toHaveProperty('approximators');
  });
});
