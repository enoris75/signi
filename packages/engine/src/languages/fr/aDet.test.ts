import { describe, expect, test } from 'vitest';
import { ANGE, CHAT, HOMME, MAISON, VITESSE } from './fr.fixtures.js';
import { aDet } from './aDet.js';

describe('aDet', () => {
  test('the definite, explicit or defaulted, fuses with à', () => {
    expect(aDet(CHAT, false, 'chat')).toBe('au');
    expect(aDet({ ...MAISON, definiteness: 'definite' }, true, 'maisons')).toBe('aux');
    expect(aDet(MAISON, false, 'maison')).toBe('à la');
    expect(aDet(HOMME, false, 'homme')).toBe("à l'");
  });

  test('any other determiner follows a plain à, which never elides', () => {
    expect(aDet({ ...MAISON, definiteness: 'indefinite' }, false, 'maison')).toBe('à une');
    expect(aDet({ ...ANGE, definiteness: 'indefinite' }, false, 'ange')).toBe('à un');
    expect(aDet({ ...CHAT, definiteness: 'some' }, true, 'chats')).toBe('à quelques');
    expect(aDet({ ...ANGE, definiteness: 'this' }, false, 'ange')).toBe('à cet');
  });

  test('a bare phrase takes à alone ("à grande vitesse")', () => {
    expect(aDet({ ...VITESSE, definiteness: 'bare' }, false, 'grande')).toBe('à');
  });
});
