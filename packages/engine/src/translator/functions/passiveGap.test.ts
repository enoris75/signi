import { describe, expect, test } from 'vitest';
import { passiveGap } from './passiveGap.js';

describe('passiveGap', () => {
  test('the patient gapped as the object is the subject; the agent gapped as the subject is the by-phrase', () => {
    expect(passiveGap('directObject')).toBe('subject');
    expect(passiveGap('subject')).toBe('agent');
  });

  test('any other gap stays where it was', () => {
    expect(passiveGap('locative')).toBe('locative');
    expect(passiveGap('possessor')).toBe('possessor');
    expect(passiveGap('instrumental')).toBe('instrumental');
  });
});
