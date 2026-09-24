import { describe, expect, test } from 'vitest';
import { clause, complement, el, np, vp } from '../../languages/resolved.fixtures.js';
import { singleNegativeWord } from './singleNegativeWord.js';

const JEMAND = { base: 'jemand', disjunctive: 'jemandem', person: '3', indefinite: '1' };
const NIEMAND = { ...JEMAND, base: 'niemand', disjunctive: 'niemandem', definiteness: 'no' };
const ETWAS = { base: 'etwas', person: '3', thing: '1', gender: 'neut', indefinite: '1' };
const NICHTS = { ...ETWAS, base: 'nichts', definiteness: 'no' };
const KATER = { base: 'Kater', gender: 'masc' };

// A308 follow-up
describe('singleNegativeWord', () => {
  const positiveObject = el(np(ETWAS));
  const positiveRecipient = el(np(JEMAND));
  const swapped = () => clause(np(KATER), vp({ base: 'geben' }, { negative: true }), {
    directObject: el(np(NICHTS)),
    complements: { terminus: complement(el(np(NIEMAND))) },
  });
  const positive = { subject: el(np(KATER)), directObject: positiveObject, complements: { terminus: complement(positiveRecipient) } };

  test('German keeps the first negative word, the dative ahead of the object, and reverts the rest', () => {
    const out = singleNegativeWord(swapped(), positive, 'de', false);
    expect(out.complements?.terminus?.phrase.conjuncts[0].head.forms['base']).toBe('niemand');
    expect(out.directObject).toBe(positiveObject);
  });

  test('a negative subject comes first', () => {
    const plan = { ...swapped(), subject: el(np(NIEMAND)) };
    const out = singleNegativeWord(plan, positive, 'de', false);
    expect(out.directObject).toBe(positiveObject);
    expect(out.complements?.terminus?.phrase).toBe(positiveRecipient);
  });

  test('a language with negative concord is untouched', () => {
    const plan = swapped();
    expect(singleNegativeWord(plan, positive, 'it', false)).toBe(plan);
  });
});
