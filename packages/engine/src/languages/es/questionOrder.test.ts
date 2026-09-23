import { describe, expect, test } from 'vitest';
import { questionOrder } from './questionOrder.js';

const verb = { conceptId: 'V', forms: { base: 'x' } };
const what = { role: 'directObject' as const, animate: false };
const where = { role: 'locative' as const, animate: false };

describe('questionOrder (es)', () => {
  test('a statement keeps its order', () => {
    expect(questionOrder(undefined, 'el gato', 'come', '', verb)).toEqual(['el gato', 'come']);
  });

  test('a subject question writes its word in the subject slot', () => {
    expect(questionOrder({ role: 'subject', animate: true }, '', 'come la comida', 'come', verb)).toEqual(['quién', 'come la comida']);
  });

  test('the subject goes right behind the verb group', () => {
    expect(questionOrder(what, 'el gato', 'come', 'come', verb)).toEqual(['qué', 'come el gato']);
    expect(questionOrder(where, 'el gato', 'come la comida', 'come', verb)).toEqual(['dónde', 'come el gato la comida']);
    expect(questionOrder(where, 'el gato', 'ha comido la comida', 'ha comido', verb)).toEqual(['dónde', 'ha comido el gato la comida']);
  });

  test('a predicate that does not open on the verb group closes on the subject', () => {
    expect(questionOrder(where, 'el gato', 'lo come', 'come', verb)).toEqual(['dónde', 'lo come el gato']);
    expect(questionOrder(where, '', 'como', 'como', verb)).toEqual(['dónde', 'como']);
  });
});
