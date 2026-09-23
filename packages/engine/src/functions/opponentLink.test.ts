import { describe, expect, test } from 'vitest';
import { opponentLink } from './opponentLink.js';

describe('opponentLink', () => {
  test('reads the adposition the verb marks its opponent with', () => {
    expect(opponentLink({ base: '戦う', opponent_prep: 'と' })).toBe('と');
  });

  test('a verb naming none leaves the language its own', () => {
    expect(opponentLink({ base: '遊ぶ' })).toBe('');
    expect(opponentLink({ base: '考える', topic_prep: 'に' })).toBe('');
    expect(opponentLink()).toBe('');
  });
});
