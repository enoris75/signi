import { describe, expect, test } from 'vitest';
import { tonicPhrase } from './tonicPhrase.js';

describe('tonicPhrase', () => {
  test('an elided head carries its apostrophe, with no space', () => {
    expect(tonicPhrase("d'", 'eux')).toBe("d'eux");
    expect(tonicPhrase("autour d'", 'elles')).toBe("autour d'elles");
  });

  test('every other head is joined by a space', () => {
    expect(tonicPhrase('de', 'lui')).toBe('de lui');
    expect(tonicPhrase('vers', 'elle')).toBe('vers elle');
    expect(tonicPhrase('comme', 'moi')).toBe('comme moi');
    expect(tonicPhrase('au-dessus de', 'lui')).toBe('au-dessus de lui');
    expect(tonicPhrase('en', 'lui')).toBe('en lui');
  });
});
