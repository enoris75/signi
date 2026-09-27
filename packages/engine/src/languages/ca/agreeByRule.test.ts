import { describe, expect, test } from 'vitest';
import { agreeByRule } from './agreeByRule.js';

describe('agreeByRule', () => {
  test('-at / -it / -ut voice their t', () => {
    expect(agreeByRule('menjat', true, false)).toBe('menjada');
    expect(agreeByRule('menjat', true, true)).toBe('menjades');
    expect(agreeByRule('menjat', false, true)).toBe('menjats');
    expect(agreeByRule('begut', true, false)).toBe('beguda');
  });

  test('a consonant-final form takes +a, +s, -es', () => {
    expect(agreeByRule('junt', true, false)).toBe('junta');
    expect(agreeByRule('junt', false, true)).toBe('junts');
    expect(agreeByRule('junt', true, true)).toBe('juntes');
  });

  test('the spelling of the feminine plural follows the stem', () => {
    expect(agreeByRule('sec', true, true)).toBe('seques');
  });

  test('a sibilant takes -os in the masculine plural', () => {
    expect(agreeByRule('gros', false, true)).toBe('grosos');
  });
});
