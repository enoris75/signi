import { describe, expect, test } from 'vitest';
import { lemmaTail } from './lemmaTail.js';

describe('lemmaTail', () => {
  test('is the noun of a light-verb lemma (avere bisogno, avoir besoin)', () => {
    expect(lemmaTail({ conceptId: 'NEED', forms: { base: 'avere bisogno', '3sg_present': 'ha bisogno' } })).toBe('bisogno');
    expect(lemmaTail({ conceptId: 'NEED', forms: { base: 'avoir besoin', '3sg_present': 'a besoin' } })).toBe('besoin');
  });

  test('is empty for a one-word lemma', () => {
    expect(lemmaTail({ conceptId: 'EAT', forms: { base: 'manger' } })).toBe('');
    expect(lemmaTail({ conceptId: 'EAT', forms: {} })).toBe('');
  });

  test('is empty for a pronominal lemma, whose first word is its clitic', () => {
    expect(lemmaTail({ conceptId: 'MOVE_ONESELF', forms: { base: 'se déplacer' } })).toBe('');
    expect(lemmaTail({ conceptId: 'MOVE_ONESELF', forms: { base: 'sich bewegen' } })).toBe('');
  });
});
