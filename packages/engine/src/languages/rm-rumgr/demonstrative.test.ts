import { describe, expect, test } from 'vitest';
import { CHASA, CHAUN, UM } from './rumgr.fixtures.js';
import { demonstrative } from './demonstrative.js';

describe('demonstrative', () => {
  test('proximal: quest, questa, quests, questas', () => {
    expect(demonstrative(CHAUN, false, 'this')).toBe('quest');
    expect(demonstrative(CHASA, false, 'this')).toBe('questa');
    expect(demonstrative(CHAUN, true, 'this')).toBe('quests');
    expect(demonstrative(CHASA, true, 'this')).toBe('questas');
  });

  test('distal: quel, quella, quels, quellas', () => {
    expect(demonstrative(CHAUN, false, 'that')).toBe('quel');
    expect(demonstrative(CHASA, false, 'that')).toBe('quella');
    expect(demonstrative(CHAUN, true, 'that')).toBe('quels');
    expect(demonstrative(CHASA, true, 'that')).toBe('quellas');
  });

  test('never elides before a vowel', () => {
    expect(demonstrative(UM, false, 'this')).toBe('quest');
    expect(demonstrative(UM, false, 'that')).toBe('quel');
  });
});
