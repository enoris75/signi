import { describe, expect, test } from 'vitest';
import { BOY, CAT, CRY, EAT, np, vp } from './en.fixtures.js';
import { withRelative } from './withRelative.js';

describe('withRelative', () => {
  test('returns the text unchanged without a relative clause', () => {
    expect(withRelative('the big cat', np(CAT))).toBe('the big cat');
  });

  test('appends the relative clause after the rendered text', () => {
    expect(withRelative('the big cat', np(CAT, {}, { relative: { headRole: 'subject', verbPhrase: vp(EAT) } }))).toBe('the big cat that eats');
    expect(withRelative('the young boy', np(BOY, {}, { relative: { headRole: 'subject', verbPhrase: vp(CRY) } }))).toBe('the young boy who cries');
  });
});
