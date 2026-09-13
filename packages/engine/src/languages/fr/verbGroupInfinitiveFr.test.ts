import { describe, expect, test } from 'vitest';
import { ALLER, CHAT, EFFONDRER, FEMME, JE, MANGER, SOURIS } from './fr.fixtures.js';
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

  // A88: the clitic precedes the infinitive that governs it, and the avoir participle agrees with it.
  test('an object clitic goes before the governing infinitive', () => {
    expect(verbGroupInfinitiveFr(MANGER, CHAT, 'neutral', 'me')).toBe('me manger');
    expect(verbGroupInfinitiveFr(MANGER, CHAT, 'progressive', 'le')).toBe('être en train de le manger');
    expect(verbGroupInfinitiveFr({ base: 'ajouter', participle: 'ajouté' }, CHAT, 'prospective', 'le')).toBe("être sur le point de l'ajouter");
    expect(verbGroupInfinitiveFr(MANGER, CHAT, 'resultative', 'le')).toBe("l'avoir mangé");
  });

  test('an avoir participle agrees with the preceding object', () => {
    expect(verbGroupInfinitiveFr(MANGER, CHAT, 'resultative', 'la', SOURIS)).toBe("l'avoir mangée");
    expect(verbGroupInfinitiveFr(MANGER, CHAT, 'resultative', '', SOURIS)).toBe('avoir mangée');
  });

  // A96: a reflexive clitic agrees with the subject, before the infinitive or the perfect's être.
  test('a reflexive verb agrees its clitic with the subject', () => {
    expect(verbGroupInfinitiveFr(EFFONDRER, JE, 'neutral')).toBe("m'effondrer");
    expect(verbGroupInfinitiveFr(EFFONDRER, { ...JE, number: 'plural' }, 'progressive')).toBe('être en train de nous effondrer');
    expect(verbGroupInfinitiveFr(EFFONDRER, CHAT, 'resultative')).toBe("s'être effondré");
    expect(verbGroupInfinitiveFr(EFFONDRER, { ...FEMME }, 'resultative')).toBe("s'être effondrée");
  });
});
