import { describe, expect, test } from 'vitest';
import type { ResolvedNounElement } from '../../types.js';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import { withQuestionPossessor } from './withQuestionPossessor.js';

const el = (forms: Record<string, string>): ResolvedNounElement => ({
  conjuncts: [{ head: { conceptId: 'FOOD', forms }, adjectives: [], nounModifiers: [] }],
  agreement: forms,
});

describe('withQuestionPossessor', () => {
  test('puts the question stand-in on the noun, made definite', () => {
    const asked = withQuestionPossessor(el({ base: 'food', definiteness: 'indefinite' }), true);
    expect(isQuestionPossessor(asked.conjuncts[0].possessor)).toBe(true);
    expect(asked.conjuncts[0].head.forms['definiteness']).toBe('definite');
    expect(asked.agreement['definiteness']).toBe('definite');
  });

  test('leaves the slot alone when the question is elsewhere', () => {
    const food = el({ base: 'food' });
    expect(withQuestionPossessor(food, false)).toBe(food);
  });

  test('takes a kin name back to the common noun it was (P11-E3)', () => {
    const asked = withQuestionPossessor(el({ base: 'Maman', name_of: 'maman', proper: '1', takes_article: '0' }), true);
    const forms = asked.conjuncts[0].head.forms;
    expect(forms['base']).toBe('maman');
    expect(forms['proper']).toBeUndefined();
    expect(forms['name_of']).toBeUndefined();
  });

  test('refuses a pronoun', () => {
    expect(() => withQuestionPossessor(el({ base: 'I', person: '1' }), true)).toThrow(/pronoun.*P09-E14/);
  });
});
