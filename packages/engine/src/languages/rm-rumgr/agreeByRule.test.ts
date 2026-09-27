import { describe, expect, test } from 'vitest';
import { agreeByRule } from './agreeByRule.js';

describe('agreeByRule', () => {
  test('-à → -ada, -ads, -adas', () => {
    expect(agreeByRule('mangià', false, false)).toBe('mangià');
    expect(agreeByRule('mangià', true, false)).toBe('mangiada');
    expect(agreeByRule('mangià', false, true)).toBe('mangiads');
    expect(agreeByRule('mangià', true, true)).toBe('mangiadas');
  });

  test('-ì → -ida, -ids, -idas', () => {
    expect(agreeByRule('ì', true, false)).toBe('ida');
    expect(agreeByRule('vegnì', false, true)).toBe('vegnids');
    expect(agreeByRule('vegnì', true, true)).toBe('vegnidas');
  });

  test('after a consonant +a, +s, +as; a final -s takes no plural -s', () => {
    expect(agreeByRule('fatg', true, false)).toBe('fatga');
    expect(agreeByRule('fatg', false, true)).toBe('fatgs');
    expect(agreeByRule('fatg', true, true)).toBe('fatgas');
    expect(agreeByRule('mess', false, true)).toBe('mess');
  });
});
