import { describe, expect, test } from 'vitest';
import { CHAT, CHIEN, el, group, np, RENARD, SOURIS } from './fr.fixtures.js';
import { coordinate } from './coordinate.js';

const base = (phrase: { head: { forms: Record<string, string> } }) => phrase.head.forms['base'] ?? '';

describe('coordinate', () => {
  test('a single conjunct renders on its own', () => {
    expect(coordinate(el(np(CHAT)), base)).toBe('chat');
  });

  test('joins two conjuncts with et', () => {
    expect(coordinate(el(np(CHAT), np(CHIEN)), base)).toBe('chat et chien');
  });

  test('puts commas between all but the last pair', () => {
    expect(coordinate(el(np(CHAT), np(CHIEN), np(SOURIS), np(RENARD)), base)).toBe('chat, chien, souris et renard');
  });

  test('joins with ou for or', () => {
    expect(coordinate(group('or', np(CHAT), np(CHIEN), np(SOURIS)), base)).toBe('chat, chien ou souris');
  });

  test('drops a conjunct that renders empty', () => {
    const slot = el(np(CHAT), np(CHIEN), np(SOURIS));
    expect(coordinate(slot, (phrase) => (phrase.head.forms['base'] === 'chien' ? '' : base(phrase)))).toBe('chat et souris');
  });
});
