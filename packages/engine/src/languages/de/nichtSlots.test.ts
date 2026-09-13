import { describe, expect, test } from 'vitest';
import { nichtSlots } from './nichtSlots.js';

const empty = { beforeAspect: '', beforeAdverb: '', beforePredicative: '', after: '' };

describe('nichtSlots', () => {
  test('nothing negates: every slot is empty', () => {
    expect(nichtSlots(false, { adverb: true, predicative: true, prospective: true })).toEqual(empty);
    expect(nichtSlots(false, { adverb: false, predicative: false })).toEqual(empty);
  });

  test('a plain clause trails the objects: "isst die Maus nicht"', () => {
    expect(nichtSlots(true, { adverb: false, predicative: false })).toEqual({ ...empty, after: 'nicht' });
  });

  test('a predicate complement is led by nicht: "ist nicht müde"', () => {
    expect(nichtSlots(true, { adverb: false, predicative: true })).toEqual({ ...empty, beforePredicative: 'nicht' });
  });

  test('an adverb is led by nicht, ahead of a predicate complement too: "ist nicht immer müde"', () => {
    expect(nichtSlots(true, { adverb: true, predicative: false })).toEqual({ ...empty, beforeAdverb: 'nicht' });
    expect(nichtSlots(true, { adverb: true, predicative: true })).toEqual({ ...empty, beforeAdverb: 'nicht' });
  });

  test('the prospective wins over every other slot: "ist nicht im Begriff, immer müde zu sein"', () => {
    expect(nichtSlots(true, { prospective: true, adverb: true, predicative: true })).toEqual({ ...empty, beforeAspect: 'nicht' });
    expect(nichtSlots(true, { prospective: true, adverb: false, predicative: false })).toEqual({ ...empty, beforeAspect: 'nicht' });
  });
});
