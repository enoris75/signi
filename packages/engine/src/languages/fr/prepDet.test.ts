import { describe, expect, test } from 'vitest';
import { CHAT, EAU, ENFANT, MAISON, SOIN } from './fr.fixtures.js';
import { prepDet } from './prepDet.js';

describe('prepDet', () => {
  test('the preposition leads the determiner without contracting', () => {
    expect(prepDet('dans', MAISON, false, 'maison')).toBe('dans la');
    expect(prepDet('dans', { ...MAISON, definiteness: 'indefinite' }, false, 'maison')).toBe('dans une');
    expect(prepDet('sous', { ...CHAT, definiteness: 'some' }, true, 'chats')).toBe('sous quelques');
  });

  test('the determiner still elides on the word that follows', () => {
    expect(prepDet('vers', ENFANT, false, 'enfant')).toBe("vers l'");
    expect(prepDet('avec', { ...EAU, definiteness: 'indefinite' }, false, 'eau')).toBe("avec de l'");
  });

  test('a bare phrase leaves the preposition alone', () => {
    expect(prepDet('avec', { ...SOIN, definiteness: 'bare' }, false, 'soin')).toBe('avec');
  });
});
