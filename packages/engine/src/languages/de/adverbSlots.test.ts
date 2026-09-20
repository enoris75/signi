import { describe, expect, test } from 'vitest';
import { concept } from '../resolved.fixtures.js';
import { adverbSlots } from './adverbSlots.js';

const NICHT = { beforeAspect: '', beforeAdverb: 'nicht', beforeComplements: '', after: '' };
const NONE = { beforeAspect: '', beforeAdverb: '', beforeComplements: '', after: '' };

describe('adverbSlots', () => {
  test('a manner or frequency adverb keeps the slot before the objects', () => {
    expect(adverbSlots(concept({ base: 'schnell' }), NONE, ''))
      .toEqual({ beforeObject: 'schnell', afterObject: '', nichtBeforeObject: '', nichtAfterObject: '' });
    expect(adverbSlots(concept({ base: 'immer', subtype: 'frequency' }), NICHT, ''))
      .toEqual({ beforeObject: 'immer', afterObject: '', nichtBeforeObject: 'nicht', nichtAfterObject: '' });
  });

  test('a direction adverb follows the objects, and takes its "nicht" with it', () => {
    expect(adverbSlots(concept({ base: 'nach oben', subtype: 'direction' }), NONE, ''))
      .toEqual({ beforeObject: '', afterObject: 'nach oben', nichtBeforeObject: '', nichtAfterObject: '' });
    expect(adverbSlots(concept({ base: 'nach oben', subtype: 'direction' }), NICHT, ''))
      .toEqual({ beforeObject: '', afterObject: 'nach oben', nichtBeforeObject: '', nichtAfterObject: 'nicht' });
  });

  test("a modal's adverb keeps the leading \"nicht\" in the Mittelfeld", () => {
    expect(adverbSlots(concept({ base: 'nach oben', subtype: 'direction' }), NICHT, 'immer'))
      .toEqual({ beforeObject: '', afterObject: 'nach oben', nichtBeforeObject: 'nicht', nichtAfterObject: '' });
  });

  test('no adverb at all', () => {
    expect(adverbSlots(undefined, NONE, ''))
      .toEqual({ beforeObject: '', afterObject: '', nichtBeforeObject: '', nichtAfterObject: '' });
  });
});
