import { describe, expect, test } from 'vitest';
import { EUROPA, GAT } from './ca.fixtures.js';
import { artForms } from './artForms.js';

describe('artForms', () => {
  test('a bare place name takes the article once an adjective modifies it', () => {
    expect(artForms(EUROPA, { pre: '', post: 'antiga' })['takes_article']).toBe('1');
    expect(artForms(EUROPA, { pre: '', post: '' })).toBe(EUROPA);
  });

  test('a common noun is unchanged', () => {
    expect(artForms(GAT, { pre: 'altre', post: '' })).toBe(GAT);
  });
});
