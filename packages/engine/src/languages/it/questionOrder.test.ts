import { describe, expect, test } from 'vitest';
import { questionOrder } from './questionOrder.js';

const verb = { conceptId: 'V', forms: { base: 'x' } };

describe('questionOrder (it)', () => {
  test('a statement keeps its order', () => {
    expect(questionOrder(undefined, 'il gatto', 'mangia', verb)).toEqual(['il gatto', 'mangia']);
  });

  test('a subject question writes its word in the subject slot', () => {
    expect(questionOrder({ role: 'subject', animate: true }, '', 'mangia il cibo', verb)).toEqual(['chi', 'mangia il cibo']);
  });

  test('any other fronts its word and closes the clause on the subject', () => {
    expect(questionOrder({ role: 'directObject', animate: false }, 'il gatto', 'mangia', verb))
      .toEqual(['che cosa', 'mangia il gatto']);
    expect(questionOrder({ role: 'cause', animate: false }, 'il gatto', 'mangia il cibo', verb))
      .toEqual(['perché', 'mangia il cibo il gatto']);
    expect(questionOrder({ role: 'cause', animate: false }, '', 'mangio', verb)).toEqual(['perché', 'mangio']);
  });

  test('dove and come elide before è', () => {
    expect(questionOrder({ role: 'locative', animate: false }, 'il gatto', 'è', verb)).toEqual(["dov'è il gatto", '']);
    expect(questionOrder({ role: 'manner', animate: false }, 'il gatto', 'è', verb)).toEqual(["com'è il gatto", '']);
    expect(questionOrder({ role: 'locative', animate: false }, 'il gatto', 'era', verb)).toEqual(['dove', 'era il gatto']);
  });

  test('a source question leaves its via behind the verb (A276)', () => {
    expect(questionOrder({ role: 'source', animate: true }, 'il gatto', 'viene', verb)).toEqual(['da chi', 'viene via il gatto']);
    expect(questionOrder({ role: 'source', animate: false }, 'il gatto', 'viene', verb)).toEqual(['da dove', 'viene il gatto']);
  });
});
