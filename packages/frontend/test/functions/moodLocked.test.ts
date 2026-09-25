import { describe, expect, it } from 'vitest';
import type { WorkspaceBinding } from '../../src/components/PhraseBuilder/interfaces.ts';
import { keepsQuestion, marksLocked, moodLocked, questionLocked } from '../../src/components/PhraseBuilder/functions/moodLocked.ts';

const relation = (over: object = {}) => ({ hasSource: false, hasTarget: false, ...over });
const binding = (asTarget?: object, coordinated = false) =>
  ({
    conditional: relation(),
    coordinative: relation({ hasTarget: coordinated }),
    subordinate: { ...(asTarget && { asTarget }) },
  }) as unknown as WorkspaceBinding;

// P09-E55: the that-clause of a verb that reports a question has its question, and its marks, free.
describe('the locks on a reported question', () => {
  it('frees the marks under ASK and KNOW, and the toggle under KNOW alone', () => {
    const ask = binding({ kind: 'content', licence: 'interrogative' });
    const know = binding({ kind: 'content', licence: 'either' });
    const think = binding({ kind: 'content' });
    for (const b of [ask, know, think]) expect(moodLocked(b)).toBe(true);
    expect([ask, know, think].map(marksLocked)).toEqual([false, false, true]);
    expect([ask, know, think].map(questionLocked)).toEqual([true, false, true]);
    expect([ask, know, think].map(keepsQuestion)).toEqual([true, false, false]);
  });

  it('locks them again where the clause is in another relation, or an adverbial one', () => {
    expect(marksLocked(binding({ kind: 'content', licence: 'either' }, true))).toBe(true);
    expect(marksLocked(binding({ kind: 'adverbial', licence: 'either' }))).toBe(true);
    expect(marksLocked(undefined)).toBe(false);
  });
});
