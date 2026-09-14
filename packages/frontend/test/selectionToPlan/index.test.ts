import { describe, expect, it } from 'vitest';
import * as selectionToPlanModule from '../../src/components/PhraseBuilder/selectionToPlan/index.ts';
import { resolveAntecedent } from '../../src/components/PhraseBuilder/selectionToPlan/functions/resolveAntecedent.ts';
import { selectionToPlan } from '../../src/components/PhraseBuilder/selectionToPlan/functions/selectionToPlan.ts';

describe('the selectionToPlan module', () => {
  it('exposes the plan builder and the antecedent resolver, and nothing of its internals', () => {
    expect(Object.keys(selectionToPlanModule).sort()).toEqual(['resolveAntecedent', 'selectionToPlan']);
    expect(selectionToPlanModule.selectionToPlan).toBe(selectionToPlan);
    expect(selectionToPlanModule.resolveAntecedent).toBe(resolveAntecedent);
  });
});
