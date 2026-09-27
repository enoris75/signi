import { describe, expect, test } from 'vitest';
import { CHAUN, EL, GROND, UM, adj, el, np } from './rumgr.fixtures.js';
import { rgStandard } from './rgStandard.js';

describe('rgStandard', () => {
  test('the comparative takes che, eliding before a vowel', () => {
    expect(rgStandard(adj(GROND, { degree: 'more' }), el(np(CHAUN)))).toBe("ch'il chaun");
    expect(rgStandard(adj(GROND, { degree: 'less' }), el(np(UM)))).toBe("che l'um");
  });

  test('the equative takes sco; a pronoun is tonic', () => {
    expect(rgStandard(adj(GROND, { degree: 'equally' }), el(np(CHAUN)))).toBe('sco il chaun');
    expect(rgStandard(adj(GROND, { degree: 'more' }), el(np(EL)))).toBe("ch'el");
  });

  test("a superlative's set takes da, contracting", () => {
    expect(rgStandard(adj(GROND, { degree: 'most', domain: '1' }), el(np(CHAUN, { number: 'plural' })))).toBe('dals chauns');
  });

  test('nothing without a standard', () => {
    expect(rgStandard(adj(GROND, { degree: 'more' }), undefined)).toBe('');
  });
});
