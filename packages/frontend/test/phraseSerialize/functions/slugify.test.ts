import { describe, expect, it } from 'vitest';
import { slugify } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/slugify.ts';

describe('slugify', () => {
  it.each([
    ['Cats', 'cats'],
    ['  The cat sleeps  ', 'the-cat-sleeps'],
    ['Who? What!  Where…', 'who-what-where'],
    ['phrase_v2.final', 'phrase-v2-final'],
    ['--already-dashed--', 'already-dashed'],
    ['Già fatto', 'gi-fatto'],
    ['猫', 'phrase'],
    ['', 'phrase'],
    ['   ', 'phrase'],
  ])('turns %j into %j', (name, slug) => {
    expect(slugify(name)).toBe(slug);
  });
});
