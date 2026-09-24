import { describe, expect, test } from 'vitest';
import { experiencerGap } from './experiencerGap.js';

describe('experiencerGap', () => {
  test('the thing liked gapped as the object is the subject; the one who likes gapped as the subject is the dative', () => {
    expect(experiencerGap('directObject')).toBe('subject');
    expect(experiencerGap('subject')).toBe('terminus');
  });

  test('any other gap stays where it was', () => {
    expect(experiencerGap('locative')).toBe('locative');
    expect(experiencerGap('possessor')).toBe('possessor');
  });
});
