import { describe, expect, it } from 'vitest';
import * as workspacePlan from '../../src/components/PhraseBuilder/workspacePlan/index.ts';
import { workspaceToPlans } from '../../src/components/PhraseBuilder/workspacePlan/functions/workspaceToPlans.ts';
import { planToWorkspace } from '@signi/phrase/model/workspacePlan/functions/planToWorkspace.ts';

describe('the workspacePlan module', () => {
  it('exposes the workspace serializer and its inverse (P13), and nothing of their internals', () => {
    expect(Object.keys(workspacePlan).sort()).toEqual(['planToWorkspace', 'workspaceToPlans']);
    expect(workspacePlan.workspaceToPlans).toBe(workspaceToPlans);
    expect(workspacePlan.planToWorkspace).toBe(planToWorkspace);
  });
});
