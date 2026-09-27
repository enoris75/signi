import { describe, expect, test } from 'vitest';
import { AVAIR, CURRER, ESSER, MANGIAR } from './rumgr.fixtures.js';
import { finiteCell, hasOwnCell } from './finiteCell.js';

describe('finiteCell', () => {
  test('the present reads the present cell', () => {
    expect(finiteCell(MANGIAR, '1sg', 'present', undefined)).toBe('mangel');
    expect(finiteCell(MANGIAR, '1pl', 'present', 'indicative')).toBe('mangiain');
    expect(finiteCell({ base: 'mangiar' }, '3sg', 'present', undefined)).toBe('mangiar');
  });

  test('the conditional and the hypothetical subjunctive both read the conditional', () => {
    expect(finiteCell(MANGIAR, '3sg', 'present', 'conditional')).toBe('mangiass');
    expect(finiteCell(CURRER, '3sg', 'present', 'subjunctive')).toBe('curriss');
    expect(finiteCell(ESSER, '3sg', 'past', 'subjunctive')).toBe('fiss');
    // A verb missing the cell falls back on its present.
    expect(finiteCell({ '3sg_present': 'dat' }, '3sg', 'present', 'conditional')).toBe('dat');
  });

  test('the present subjunctive reads the conjunctiv', () => {
    expect(finiteCell(ESSER, '3sg', 'present', 'presentSubjunctive')).toBe('saja');
    expect(finiteCell({ '3sg_present': 'dat' }, '3sg', 'present', 'presentSubjunctive')).toBe('dat');
  });

  test('a state verb\'s past is its imperfect; any other past is periphrastic', () => {
    expect(finiteCell(AVAIR, '3sg', 'past', undefined)).toBe('aveva');
    expect(finiteCell(ESSER, '3pl', 'past', undefined)).toBe('eran');
    expect(finiteCell(MANGIAR, '3sg', 'past', undefined)).toBeUndefined();
  });

  test('the future is periphrastic', () => {
    expect(finiteCell(MANGIAR, '3sg', 'future', undefined)).toBeUndefined();
  });
});

describe('hasOwnCell', () => {
  test('the three moods with a cell of their own', () => {
    expect(hasOwnCell('conditional')).toBe(true);
    expect(hasOwnCell('subjunctive')).toBe(true);
    expect(hasOwnCell('presentSubjunctive')).toBe(true);
    expect(hasOwnCell('indicative')).toBe(false);
    expect(hasOwnCell(undefined)).toBe(false);
  });
});
