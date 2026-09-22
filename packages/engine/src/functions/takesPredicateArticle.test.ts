import { describe, expect, test } from 'vitest';
import { adj } from '../languages/resolved.fixtures.js';
import { takesPredicateArticle } from './takesPredicateArticle.js';

const SAME = { base: 'same', predicate_article: '1' };

describe('takesPredicateArticle', () => {
  // Localization B66: "the cat is the same", never "*is same".
  test('a marked adjective in the plain degree takes the article', () => {
    expect(takesPredicateArticle(adj(SAME))).toBe(true);
    expect(takesPredicateArticle(adj(SAME, { degree: 'positive' }))).toBe(true);
  });

  test.each(['more', 'less', 'equally', 'most', 'least'])('a %s one is the degree\'s to spell', (degree) => {
    expect(takesPredicateArticle(adj(SAME, { degree }))).toBe(false);
  });

  test('an unmarked adjective does not', () => {
    expect(takesPredicateArticle(adj({ base: 'gleich' }))).toBe(false);
    expect(takesPredicateArticle(adj({ base: 'big' }))).toBe(false);
  });
});
