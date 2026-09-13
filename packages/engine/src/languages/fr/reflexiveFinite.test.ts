import { describe, expect, test } from 'vitest';
import { ALLER, EFFONDRER, FEMME, IL, JE, TU } from './fr.fixtures.js';
import { reflexiveFinite } from './reflexiveFinite.js';

describe('reflexiveFinite', () => {
  test('a non-reflexive verb leaves the finite word alone', () => {
    expect(reflexiveFinite(ALLER, IL, 'est')).toBe('est');
  });

  test('restores the clitic before the auxiliary, eliding me/te/se before a vowel', () => {
    expect(reflexiveFinite(EFFONDRER, FEMME, 'est')).toBe("s'est");
    expect(reflexiveFinite(EFFONDRER, TU, 'es')).toBe("t'es");
    expect(reflexiveFinite(EFFONDRER, JE, 'étais')).toBe("m'étais");
  });

  test('keeps me/te/se whole before a consonant', () => {
    expect(reflexiveFinite(EFFONDRER, JE, 'suis')).toBe('me suis');
    expect(reflexiveFinite(EFFONDRER, { ...IL, number: 'plural' }, 'sont')).toBe('se sont');
    expect(reflexiveFinite(EFFONDRER, IL, 'serait')).toBe('se serait');
  });

  test('nous and vous never elide', () => {
    expect(reflexiveFinite(EFFONDRER, { ...JE, number: 'plural' }, 'sommes')).toBe('nous sommes');
    expect(reflexiveFinite(EFFONDRER, { ...TU, number: 'plural' }, 'êtes')).toBe('vous êtes');
  });

  test('also recognises an infinitive written with a full se', () => {
    expect(reflexiveFinite({ base: 'se lever' }, IL, 'est')).toBe("s'est");
  });
});
