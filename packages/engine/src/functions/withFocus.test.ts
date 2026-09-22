import { describe, expect, test } from 'vitest';
import { withFocus, type FocusWords } from './withFocus.js';

const EN: FocusWords = { only: { word: 'only' }, even: { word: 'even' }, also: { word: 'too', post: true } };

describe('withFocus', () => {
  test('leads the phrase, or follows it where the word goes there', () => {
    expect(withFocus('the cat', 'only', EN)).toBe('only the cat');
    expect(withFocus('the cat', 'even', EN)).toBe('even the cat');
    expect(withFocus('the cat', 'also', EN)).toBe('the cat too');
  });

  test('no focus, and nothing rendered, come back untouched', () => {
    expect(withFocus('the cat', undefined, EN)).toBe('the cat');
    expect(withFocus('', 'only', EN)).toBe('');
  });
});
