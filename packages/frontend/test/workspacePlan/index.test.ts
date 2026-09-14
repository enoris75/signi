import { describe, expect, it } from 'vitest';
import * as workspacePlan from '../../src/components/PhraseBuilder/workspacePlan/index.ts';
import { workspaceToPlans } from '../../src/components/PhraseBuilder/workspacePlan/functions/workspaceToPlans.ts';

describe('the workspacePlan module', () => {
  it('exposes the workspace serializer, and nothing of its internals', () => {
    expect(Object.keys(workspacePlan)).toEqual(['workspaceToPlans']);
    expect(workspacePlan.workspaceToPlans).toBe(workspaceToPlans);
  });
});
