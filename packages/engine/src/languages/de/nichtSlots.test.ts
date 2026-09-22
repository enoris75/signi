import { describe, expect, test } from 'vitest';
import { nichtSlots } from './nichtSlots.js';

const empty = { beforeAspect: '', beforeAdverb: '', beforeComplements: '', after: '' };

describe('nichtSlots', () => {
  test('nothing negates: every slot is empty', () => {
    expect(nichtSlots(0, { adverb: true, complements: true, prospective: true })).toEqual(empty);
    expect(nichtSlots(0, { adverb: false, complements: false })).toEqual(empty);
  });

  test('with no complement to lead it trails the objects: "isst die Maus nicht"', () => {
    expect(nichtSlots(1, { adverb: false, complements: false })).toEqual({ ...empty, after: 'nicht' });
  });

  test('a complement is led by nicht: "ist nicht müde", "geht nicht zum Markt"', () => {
    expect(nichtSlots(1, { adverb: false, complements: true })).toEqual({ ...empty, beforeComplements: 'nicht' });
  });

  test('an adverb is led by nicht, ahead of the complements too: "ist nicht immer müde"', () => {
    expect(nichtSlots(1, { adverb: true, complements: false })).toEqual({ ...empty, beforeAdverb: 'nicht' });
    expect(nichtSlots(1, { adverb: true, complements: true })).toEqual({ ...empty, beforeAdverb: 'nicht' });
  });

  test('the prospective wins over every other slot: "ist nicht im Begriff, immer müde zu sein"', () => {
    expect(nichtSlots(1, { prospective: true, adverb: true, complements: true })).toEqual({ ...empty, beforeAspect: 'nicht' });
    expect(nichtSlots(1, { prospective: true, adverb: false, complements: false })).toEqual({ ...empty, beforeAspect: 'nicht' });
  });

  // A03: two denied words of the verb group ("ich will nicht nicht gehen") put both "nicht" in the
  // one slot the single one takes, so every clause order splices them exactly as it always did.
  test('two negations share the slot: "will nicht nicht gehen", "will das Essen nicht nicht essen"', () => {
    expect(nichtSlots(2, { adverb: false, complements: false })).toEqual({ ...empty, after: 'nicht nicht' });
    expect(nichtSlots(2, { adverb: true, complements: false })).toEqual({ ...empty, beforeAdverb: 'nicht nicht' });
    expect(nichtSlots(2, { adverb: false, complements: true })).toEqual({ ...empty, beforeComplements: 'nicht nicht' });
    expect(nichtSlots(2, { prospective: true, adverb: false, complements: false })).toEqual({ ...empty, beforeAspect: 'nicht nicht' });
    expect(nichtSlots(3, { adverb: false, complements: false })).toEqual({ ...empty, after: 'nicht nicht nicht' });
  });
});
