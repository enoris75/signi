import { describe, expect, test } from 'vitest';
import { ANGE, CHAT, EAU, HOMME, MAISON, MANIERE, NOURRITURE } from './fr.fixtures.js';
import { deDet } from './deDet.js';

describe('deDet', () => {
  test('the definite, explicit or defaulted, fuses with de', () => {
    expect(deDet(CHAT, false, 'chat')).toBe('du');
    expect(deDet({ ...MAISON, definiteness: 'definite' }, true, 'maisons')).toBe('des');
    expect(deDet(MAISON, false, 'maison')).toBe('de la');
    expect(deDet(HOMME, false, 'homme')).toBe("de l'");
  });

  test('the plural indefinite des drops after de', () => {
    expect(deDet({ ...MAISON, definiteness: 'indefinite' }, true, 'maisons')).toBe('de');
    expect(deDet({ ...ANGE, definiteness: 'indefinite' }, true, 'anges')).toBe("d'");
    expect(deDet({ ...HOMME, definiteness: 'indefinite' }, true, 'hommes')).toBe("d'");
  });

  test('a mass noun’s partitive drops after de', () => {
    expect(deDet({ ...EAU, definiteness: 'indefinite' }, false, 'eau')).toBe("d'");
    expect(deDet({ ...NOURRITURE, definiteness: 'some' }, false, 'nourriture')).toBe('de');
  });

  test('a bare phrase takes de alone, eliding before a vowel sound', () => {
    expect(deDet({ ...CHAT, definiteness: 'bare' }, false, 'chat')).toBe('de');
    expect(deDet({ ...HOMME, definiteness: 'bare' }, false, 'homme')).toBe("d'");
  });

  test('a surviving determiner is kept, de eliding before a vowel-initial one', () => {
    expect(deDet({ ...MANIERE, definiteness: 'indefinite' }, false, 'bonne')).toBe("d'une");
    expect(deDet({ ...CHAT, definiteness: 'no' }, false, 'chat')).toBe("d'aucun");
    expect(deDet({ ...CHAT, definiteness: 'some' }, true, 'chats')).toBe('de quelques');
    expect(deDet({ ...ANGE, definiteness: 'this' }, false, 'ange')).toBe('de cet');
    expect(deDet({ ...MAISON, definiteness: 'all' }, true, 'maisons')).toBe('de toutes les');
  });
});
