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

  test('an adverb that outscopes "nicht" leads it, in its negative word where it has one (P09-E28)', () => {
    expect(adverbSlots(concept({ base: 'schon', subtype: 'frequency', negative: 'noch', negative_slot: 'pre-negator' }), NICHT, ''))
      .toEqual({ beforeObject: '', afterObject: '', nichtBeforeObject: 'noch nicht', nichtAfterObject: '' });
    expect(adverbSlots(concept({ base: 'auch', subtype: 'frequency', negative_slot: 'pre-negator' }), NICHT, ''))
      .toEqual({ beforeObject: '', afterObject: '', nichtBeforeObject: 'auch nicht', nichtAfterObject: '' });
  });

  test('further adverbs take their class\'s slot, time–manner–place (P15)', () => {
    const OFT = concept({ base: 'oft', subtype: 'frequency' });
    const more = [concept({ base: 'schnell' }), concept({ base: 'hier', subtype: 'place' }), concept({ base: 'wieder', subtype: 'frequency' })];
    expect(adverbSlots(OFT, NICHT, '', more))
      .toEqual({ beforeObject: 'oft wieder schnell', afterObject: 'hier', nichtBeforeObject: 'nicht', nichtAfterObject: '' });
  });

  test('a direction adverb closes the Mittelfeld behind a place one, and "nicht" leads it alone (P15)', () => {
    const UP = concept({ base: 'nach oben', subtype: 'direction' });
    const HERE = concept({ base: 'hier', subtype: 'place' });
    expect(adverbSlots(UP, NICHT, '', [HERE]))
      .toEqual({ beforeObject: '', afterObject: 'nach oben', nichtBeforeObject: '', nichtAfterObject: 'hier nicht' });
    expect(adverbSlots(HERE, NONE, '', [UP]))
      .toEqual({ beforeObject: '', afterObject: 'nach oben', nichtBeforeObject: '', nichtAfterObject: 'hier' });
  });

  test('no adverb at all', () => {
    expect(adverbSlots(undefined, NONE, ''))
      .toEqual({ beforeObject: '', afterObject: '', nichtBeforeObject: '', nichtAfterObject: '' });
  });
});
