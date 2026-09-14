import { describe, expect, it } from 'vitest';
import * as periodContainer from '../../src/components/PhraseBuilder/PeriodContainer/index.ts';
import { PeriodContainer } from '../../src/components/PhraseBuilder/PeriodContainer/PeriodContainer.tsx';
import { periodControls } from '../../src/components/PhraseBuilder/PeriodContainer/functions/periodControls.ts';

describe('the PeriodContainer module', () => {
  it('exposes the card and its control derivation, and nothing of its internals', () => {
    expect(Object.keys(periodContainer).sort()).toEqual(['PeriodContainer', 'periodControls']);
    expect(periodContainer.PeriodContainer).toBe(PeriodContainer);
    expect(periodContainer.periodControls).toBe(periodControls);
  });
});
