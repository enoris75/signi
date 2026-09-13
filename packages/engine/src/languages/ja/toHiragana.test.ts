import { describe, expect, test } from 'vitest';
import { toHiragana } from './toHiragana.js';

describe('toHiragana', () => {
  test('folds katakana to hiragana', () => {
    expect(toHiragana('ネズミ')).toBe('ねずみ');
    expect(toHiragana('キツネ')).toBe('きつね');
  });

  test('keeps the long-vowel mark, which has no hiragana counterpart', () => {
    expect(toHiragana('フレーズ')).toBe('ふれーず');
  });

  test('leaves hiragana and kanji untouched', () => {
    expect(toHiragana('いつも')).toBe('いつも');
    expect(toHiragana('猫')).toBe('猫');
    expect(toHiragana('イタリア語')).toBe('いたりあ語');
  });
});
