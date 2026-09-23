import { describe, expect, test } from 'vitest';
import type { PhrasePlan } from '@signi/shared';
import { resolveQuestion } from './resolveQuestion.js';

const plan = (extra: Partial<PhrasePlan>): PhrasePlan => ({
  subject: { concept: 'CAT' }, verbPhrase: { verb: 'EAT' }, ...extra,
});

describe('resolveQuestion', () => {
  test('no gap, or a force that does not hold, is no question', () => {
    expect(resolveQuestion(plan({}), true)).toBeUndefined();
    expect(resolveQuestion(plan({ questionRole: 'directObject' }), false)).toBeUndefined();
  });

  test('the five gaps that have a word, animacy defaulting to what', () => {
    expect(resolveQuestion(plan({ questionRole: 'subject', questionAnimate: true }), true))
      .toEqual({ role: 'subject', animate: true });
    expect(resolveQuestion(plan({ questionRole: 'directObject' }), true)).toEqual({ role: 'directObject', animate: false });
    expect(resolveQuestion(plan({ questionRole: 'manner' }), true)?.role).toBe('manner');
    expect(resolveQuestion(plan({ questionRole: 'locative' }), true)?.role).toBe('locative');
    expect(resolveQuestion(plan({ questionRole: 'locative', questionSpecifiers: [{ kind: 'path', value: 'in' }] }), true)?.role)
      .toBe('locative');
    expect(resolveQuestion(plan({ questionRole: 'cause', questionSpecifiers: [{ kind: 'sentiment', value: 'neutral' }] }), true)?.role)
      .toBe('cause');
  });

  test('a marked relation or another complement gap keeps its relation (P09-E15)', () => {
    const under = [{ kind: 'path', value: 'under' }] as const;
    expect(resolveQuestion(plan({ questionRole: 'locative', questionSpecifiers: [...under] }), true))
      .toEqual({ role: 'locative', animate: false, specifiers: under });
    expect(resolveQuestion(plan({ questionRole: 'cause', questionSpecifiers: [{ kind: 'sentiment', value: 'positive' }], questionAnimate: true }), true))
      .toMatchObject({ role: 'cause', animate: true });
    expect(resolveQuestion(plan({ questionRole: 'instrumental' }), true)).toEqual({ role: 'instrumental', animate: false });
    for (const role of ['direction', 'source', 'route', 'comitative', 'terminus', 'topic'] as const) {
      expect(resolveQuestion(plan({ questionRole: role }), true)?.role).toBe(role);
    }
    expect(resolveQuestion(plan({ questionRole: 'temporal', questionSpecifiers: [{ kind: 'temporal', value: 'until' }] }), true)?.role)
      .toBe('temporal');
  });

  test('a negative cause asks whose fault, so it is always a person (P09-E15 D4)', () => {
    expect(resolveQuestion(plan({ questionRole: 'cause', questionSpecifiers: [{ kind: 'sentiment', value: 'negative' }] }), true)?.animate)
      .toBe(true);
  });

  test('the gaps with no question here are refused by name (P09-E15)', () => {
    const ask = (extra: Partial<PhrasePlan>) => () => resolveQuestion(plan(extra), true);
    for (const value of ['ago', 'after', 'before', 'during'] as const) {
      expect(ask({ questionRole: 'temporal', questionSpecifiers: [{ kind: 'temporal', value }] })).toThrow(new RegExp(`temporal.*${value}.*P09-E15`));
    }
    expect(ask({ questionRole: 'purpose' })).toThrow(/purpose.*why.*P09-E15/);
    expect(ask({ questionRole: 'predicative' })).toThrow(/predicative.*P09-E15/);
    expect(ask({ questionRole: 'objectPredicative' })).toThrow(/objectPredicative.*P09-E15/);
    expect(ask({ questionRole: 'role' })).toThrow(/role.*P09-E15/);
    expect(ask({ questionRole: 'instrumental', questionSpecifiers: [{ kind: 'abstraction', value: 'process' }] })).toThrow(/process.*how.*P09-E15/);
  });

  test('a possessor gap asks inside the subject by default, or the object, always for a person (P09-E14)', () => {
    expect(resolveQuestion(plan({ questionRole: 'possessor' }), true)).toEqual({ role: 'possessor', possessed: 'subject', animate: true });
    expect(resolveQuestion(plan({ questionRole: 'possessor', questionPossessed: 'directObject', questionAnimate: false, directObject: { concept: 'FOOD' } }), true))
      .toEqual({ role: 'possessor', possessed: 'directObject', animate: true });
  });

  test('a possessor gap refuses a slot it cannot ask inside (P09-E14)', () => {
    const ask = (extra: Partial<PhrasePlan>) => () => resolveQuestion(plan({ questionRole: 'possessor', ...extra }), true);
    expect(ask({ questionPossessed: 'directObject' })).toThrow(/needs a directObject.*P09-E14/);
    expect(ask({ subject: { concept: 'CAT', possessor: { concept: 'MAN' } } })).toThrow(/already has a possessor.*P09-E14/);
    expect(ask({ subject: { concept: 'PART', possessorRole: 'whole' } })).toThrow(/owner.*P09-E14/);
    expect(ask({ subject: { conjuncts: [{ concept: 'CAT' }, { concept: 'DOG' }], conjunction: 'and' } })).toThrow(/coordination.*P09-E14/);
    expect(ask({ questionPossessed: 'locative' as never })).toThrow(/subject or the direct object.*P09-E14/);
  });
});
