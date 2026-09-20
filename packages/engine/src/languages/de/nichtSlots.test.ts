import { describe, expect, test } from 'vitest';
import { nichtSlots } from './nichtSlots.js';

const empty = { beforeAspect: '', beforeAdverb: '', beforeComplements: '', after: '' };

describe('nichtSlots', () => {
  test('nothing negates: every slot is empty', () => {
    expect(nichtSlots(false, { adverb: true, complements: true, prospective: true })).toEqual(empty);
    expect(nichtSlots(false, { adverb: false, complements: false })).toEqual(empty);
  });

  test('with no complement to lead it trails the objects: "isst die Maus nicht"', () => {
    expect(nichtSlots(true, { adverb: false, complements: false })).toEqual({ ...empty, after: 'nicht' });
  });

  test('a complement is led by nicht: "ist nicht müde", "geht nicht zum Markt"', () => {
    expect(nichtSlots(true, { adverb: false, complements: true })).toEqual({ ...empty, beforeComplements: 'nicht' });
  });

  test('an adverb is led by nicht, ahead of the complements too: "ist nicht immer müde"', () => {
    expect(nichtSlots(true, { adverb: true, complements: false })).toEqual({ ...empty, beforeAdverb: 'nicht' });
    expect(nichtSlots(true, { adverb: true, complements: true })).toEqual({ ...empty, beforeAdverb: 'nicht' });
  });

  test('the prospective wins over every other slot: "ist nicht im Begriff, immer müde zu sein"', () => {
    expect(nichtSlots(true, { prospective: true, adverb: true, complements: true })).toEqual({ ...empty, beforeAspect: 'nicht' });
    expect(nichtSlots(true, { prospective: true, adverb: false, complements: false })).toEqual({ ...empty, beforeAspect: 'nicht' });
  });
});
