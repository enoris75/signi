import { describe, expect, test } from 'vitest';
import { punctuate } from './punctuate.js';

describe('punctuate', () => {
  test('a closing comma inside the sentence stays', () => {
    expect(punctuate('le chien qui nous voit, lui et moi, court')).toBe('le chien qui nous voit, lui et moi, court');
  });

  test('a closing comma against a clause join collapses into it', () => {
    expect(punctuate('le chat nous voit, lui et moi,, et le chien court')).toBe('le chat nous voit, lui et moi, et le chien court');
    expect(punctuate('si le chat nous voyait, lui et moi, , le chien courrait')).toBe('si le chat nous voyait, lui et moi, le chien courrait');
  });

  test('a trailing comma gives way to the full stop', () => {
    expect(punctuate('le chat nous voit, lui et moi,')).toBe('le chat nous voit, lui et moi');
  });

  test('a sentence with no stray comma is unchanged', () => {
    expect(punctuate('le chat voit le chien et la souris')).toBe('le chat voit le chien et la souris');
  });
});
