import { describe, expect, test } from 'vitest';
import { BELLO, BUONO, concept, GRANDE, VECCHIO } from './it.fixtures.js';
import { prenominalChain } from './prenominalChain.js';

const BEAUTIFUL = concept(BELLO, 'BEAUTIFUL');
const BIG = concept(GRANDE, 'BIG');
const OLD = concept(VECCHIO, 'OLD');

describe('prenominalChain', () => {
  test('no prenominal adjectives, no words', () => {
    expect(prenominalChain([], 'masc', false, 'gatto')).toEqual([]);
  });

  test('each adjective agrees with the head, in order', () => {
    expect(prenominalChain([BIG, OLD], 'fem', true, 'gatte')).toEqual(['grandi', 'vecchie']);
  });

  test('bello agrees with the sound of the noun right after it', () => {
    expect(prenominalChain([BEAUTIFUL], 'masc', false, 'uomo')).toEqual(["bell'"]);
    expect(prenominalChain([BEAUTIFUL], 'masc', true, 'uomini')).toEqual(['begli']);
  });

  test('resolved right to left, so bello agrees with the adjective that follows it', () => {
    // "un bel grande uomo", not "bell'" as it would be before "uomo"
    expect(prenominalChain([BEAUTIFUL, BIG], 'masc', false, 'uomo')).toEqual(['bel', 'grande']);
    // "il grande bell'uomo"
    expect(prenominalChain([BIG, BEAUTIFUL], 'masc', false, 'uomo')).toEqual(['grande', "bell'"]);
  });

  test('buono apocopates before the next word too', () => {
    expect(prenominalChain([concept(BUONO, 'GOOD'), OLD], 'masc', false, 'cane')).toEqual(['buon', 'vecchio']);
  });

  test('a degree adverb is emitted in front, agreement still keyed off the bare form', () => {
    // "il più bell'uomo"
    const most = concept({ ...BELLO, degree: 'most' }, 'BEAUTIFUL');
    expect(prenominalChain([most], 'masc', false, 'uomo')).toEqual(["più bell'"]);
  });

  test('an adjective with no surface is dropped without breaking the chain', () => {
    expect(prenominalChain([BEAUTIFUL, concept({}, 'BIG')], 'masc', false, 'uomo')).toEqual(["bell'"]);
  });
});
