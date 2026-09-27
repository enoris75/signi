import { describe, expect, test } from 'vitest';
import { questionOrder } from './questionOrder.js';

const verb = { conceptId: 'EAT', forms: { base: 'menjar' } };

describe('questionOrder', () => {
  test('a statement keeps its order', () => {
    expect(questionOrder(undefined, 'el gat', 'menja el ratolí', 'menja', verb)).toEqual(['el gat', 'menja el ratolí']);
  });

  test('a subject question writes its word in the subject\'s slot', () => {
    expect(questionOrder({ role: 'subject', animate: true }, 'el gat', 'menja el ratolí', 'menja', verb)).toEqual(['qui', 'menja el ratolí']);
  });

  test('any other fronts its word and puts the subject behind the verb group', () => {
    expect(questionOrder({ role: 'directObject', animate: false }, 'el gat', 'menja', 'menja', verb)).toEqual(['què', 'menja el gat']);
    expect(questionOrder({ role: 'locative', animate: false }, 'el gat', 'menja el ratolí', 'menja', verb)).toEqual(['on', 'menja el gat el ratolí']);
  });

  test('where a clitic leads the predicate, the subject closes it', () => {
    expect(questionOrder({ role: 'locative', animate: false }, 'el gat', 'el menja', 'menja', verb)).toEqual(['on', 'el menja el gat']);
  });
});
