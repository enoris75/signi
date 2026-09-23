import { describe, expect, test } from 'vitest';
import { questionPronoun } from './questionPronoun.js';

describe('questionPronoun', () => {
  test('wer declines for a person', () => {
    expect(questionPronoun({ animate: '1' }, 'nom')).toBe('wer');
    expect(questionPronoun({ animate: '1' }, 'acc')).toBe('wen');
    expect(questionPronoun({ animate: '1' }, 'dat')).toBe('wem');
    expect(questionPronoun({ animate: '1' }, 'gen')).toBe('wessen');
  });

  test('was does not, for a thing', () => {
    expect(questionPronoun({}, 'dat')).toBe('was');
    expect(questionPronoun({}, 'acc')).toBe('was');
  });
});
