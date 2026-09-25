import { describe, expect, it } from 'vitest';
import type { Concept, NounElement, PhrasePlan } from '@signi/shared';
import { planToWorkspace } from '@signi/phrase/model/workspacePlan/functions/planToWorkspace.ts';
import { workspaceToPlans } from '../../../src/components/PhraseBuilder/workspacePlan/functions/workspaceToPlans.ts';

const concept = (id: string, role: Concept['role']): Concept => ({ id, role, description: id, label: id });
const WORDS = new Map([concept('CAT', 'noun'), concept('DOG', 'noun'), concept('MAN', 'noun'), concept('RUN', 'verb')].map((c) => [c.id, c]));
const conceptOf = (id: string) => WORDS.get(id);

const run = (subject: NounElement): PhrasePlan => ({ subject, verbPhrase: { verb: 'RUN' } });

// P09-E46: "both … and" on the canvas is a flag on an "and" pair, so a plan's correlative comes back
// whole on one, and is named unsaid anywhere the engine would ignore it.
describe('planToWorkspace: the correlative', () => {
  it('holds an "and" pair’s correlative, and gives it back', () => {
    const plan = run({ conjuncts: [{ concept: 'CAT' }, { concept: 'DOG' }], conjunction: 'and', correlative: true });
    const { containers, links, unsupported } = planToWorkspace(plan, conceptOf);

    expect(unsupported).toEqual([]);
    expect(containers[0]!.selection.correlatives).toEqual({ subject: true });
    expect(workspaceToPlans(containers, links)[0]!.plan.subject).toMatchObject({ conjunction: 'and', correlative: true });
  });

  it.each<[string, NounElement]>([
    ['on "or"', { conjuncts: [{ concept: 'CAT' }, { concept: 'DOG' }], conjunction: 'or', correlative: true }],
    ['on three conjuncts', { conjuncts: [{ concept: 'CAT' }, { concept: 'DOG' }, { concept: 'MAN' }], conjunction: 'and', correlative: true }],
  ])('names one %s as unsaid', (_, subject) => {
    const { containers, unsupported } = planToWorkspace(run(subject), conceptOf);

    expect(unsupported).toEqual(['NounGroup.correlative off a pair']);
    expect(containers[0]!.selection).not.toHaveProperty('correlatives');
  });
});
