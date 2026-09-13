import { describe, expect, test } from 'vitest';
import { ALLER, CHAT, FEMME, MANGER } from './fr.fixtures.js';
import { verbGroupInfinitiveFr } from './verbGroupInfinitiveFr.js';

describe('verbGroupInfinitiveFr', () => {
  test('neutral is the bare infinitive', () => {
    expect(verbGroupInfinitiveFr(MANGER, CHAT, 'neutral')).toBe('manger');
  });

  test('the progressive and prospective put être in the infinitive, de eliding before a vowel', () => {
    expect(verbGroupInfinitiveFr(MANGER, CHAT, 'progressive')).toBe('être en train de manger');
    expect(verbGroupInfinitiveFr(ALLER, CHAT, 'progressive')).toBe("être en train d'aller");
    expect(verbGroupInfinitiveFr(MANGER, CHAT, 'prospective')).toBe('être sur le point de manger');
  });

  test('the resultative is avoir + participle, or être + a participle agreeing with the subject', () => {
    expect(verbGroupInfinitiveFr(MANGER, FEMME, 'resultative')).toBe('avoir mangé');
    expect(verbGroupInfinitiveFr(ALLER, CHAT, 'resultative')).toBe('être allé');
    expect(verbGroupInfinitiveFr(ALLER, { ...FEMME, number: 'plural' }, 'resultative')).toBe('être allées');
  });
});
