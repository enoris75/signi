import { describe, expect, test } from 'vitest';
import { adj, BAD, BEAUTIFUL, BIG, GOOD, HAPPY, STRONG, TIRED } from './en.fixtures.js';
import { enAdj } from './enAdj.js';

describe('enAdj', () => {
  test('the positive degree is the bare base', () => {
    expect(enAdj(adj(BIG))).toBe('big');
    expect(enAdj(adj(BEAUTIFUL, { degree: 'positive' }))).toBe('beautiful');
  });

  test('a short adjective inflects for more and most', () => {
    expect(enAdj(adj(BIG, { degree: 'more' }))).toBe('bigger');
    expect(enAdj(adj(HAPPY, { degree: 'most' }))).toBe('happiest');
  });

  test('good and bad compare suppletively', () => {
    expect(enAdj(adj(GOOD, { degree: 'more' }))).toBe('better');
    expect(enAdj(adj(GOOD, { degree: 'most' }))).toBe('best');
    expect(enAdj(adj(BAD, { degree: 'more' }))).toBe('worse');
    expect(enAdj(adj(BAD, { degree: 'most' }))).toBe('worst');
  });

  test('a long or participial adjective takes more and most', () => {
    expect(enAdj(adj(BEAUTIFUL, { degree: 'more' }))).toBe('more beautiful');
    expect(enAdj(adj(TIRED, { degree: 'most' }))).toBe('most tired');
  });

  test('less, least and equally are periphrastic even on a short adjective', () => {
    expect(enAdj(adj(HAPPY, { degree: 'less' }))).toBe('less happy');
    expect(enAdj(adj(BEAUTIFUL, { degree: 'least' }))).toBe('least beautiful');
    expect(enAdj(adj(STRONG, { degree: 'equally' }))).toBe('equally strong');
  });

  test('an adjective with no English base renders nothing', () => {
    expect(enAdj(adj({ role: 'adjective' }, { degree: 'more' }))).toBe('');
  });
});
