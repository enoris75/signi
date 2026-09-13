import { describe, expect, test } from 'vitest';
import { CHAT, MANIERE, RENARD, SOIN, TEMPS, VITESSE } from './fr.fixtures.js';
import { frMannerHead } from './frMannerHead.js';

describe('frMannerHead', () => {
  test('a noun with no manner relation is similative comme, with a plain article', () => {
    expect(frMannerHead(RENARD)(false, 'renard')).toBe('comme le');
    expect(frMannerHead({ ...CHAT, definiteness: 'indefinite' })(false, 'chat')).toBe('comme un');
    expect(frMannerHead(CHAT)(true, 'chats')).toBe('comme les');
  });

  test('means is avec, contracting with nothing', () => {
    expect(frMannerHead({ ...SOIN, definiteness: 'bare' })(false, 'soin')).toBe('avec');
    expect(frMannerHead(SOIN)(false, 'soin')).toBe('avec le');
  });

  test('measure is à, fused with a definite article', () => {
    expect(frMannerHead(VITESSE)(false, 'vitesse')).toBe('à la');
    expect(frMannerHead(TEMPS)(false, 'temps')).toBe('au');
    expect(frMannerHead(TEMPS)(true, 'temps')).toBe('aux');
    expect(frMannerHead({ ...VITESSE, definiteness: 'indefinite' })(false, 'vitesse')).toBe('à une');
    expect(frMannerHead({ ...VITESSE, definiteness: 'bare' })(false, 'vitesse')).toBe('à');
  });

  test('mode is de, fused with a definite article and elided before a vowel', () => {
    expect(frMannerHead(MANIERE)(false, 'manière')).toBe('de la');
    expect(frMannerHead(MANIERE)(true, 'manières')).toBe('des');
    expect(frMannerHead({ ...MANIERE, definiteness: 'indefinite' })(false, 'manière')).toBe("d'une");
    expect(frMannerHead({ ...MANIERE, definiteness: 'this' })(false, 'manière')).toBe('de cette');
  });
});
