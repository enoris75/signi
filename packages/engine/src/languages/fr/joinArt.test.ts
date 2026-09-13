import { describe, expect, test } from 'vitest';
import { joinArt } from './joinArt.js';

describe('joinArt', () => {
  test('joins a full article with a space', () => {
    expect(joinArt('le', 'chat')).toBe('le chat');
    expect(joinArt('de la', 'nourriture')).toBe('de la nourriture');
  });

  test('joins an elided head with no space', () => {
    expect(joinArt("l'", 'ange')).toBe("l'ange");
    expect(joinArt("beaucoup d'", 'eau')).toBe("beaucoup d'eau");
  });

  test('a bare phrase has no head', () => {
    expect(joinArt('', 'chats')).toBe('chats');
  });
});
