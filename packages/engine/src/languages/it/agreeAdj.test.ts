import { describe, expect, test } from 'vitest';
import { agreeAdj } from './agreeAdj.js';

describe('agreeAdj', () => {
  test('the -o class inflects for gender and number', () => {
    expect(agreeAdj('freddo', 'masc', false)).toBe('freddo');
    expect(agreeAdj('freddo', 'fem', false)).toBe('fredda');
    expect(agreeAdj('freddo', 'masc', true)).toBe('freddi');
    expect(agreeAdj('freddo', 'fem', true)).toBe('fredde');
  });

  test('-co and -go keep the hard consonant in the plural', () => {
    expect(agreeAdj('stanco', 'masc', true)).toBe('stanchi');
    expect(agreeAdj('stanco', 'fem', true)).toBe('stanche');
    expect(agreeAdj('lungo', 'masc', true)).toBe('lunghi');
    expect(agreeAdj('lungo', 'fem', true)).toBe('lunghe');
  });

  // A81: a proparoxytone -ico softens its masculine plural; the feminine and the exceptions stay hard.
  test('an -ico adjective of three or more syllables takes -ici in the masculine plural', () => {
    expect(agreeAdj('domestico', 'masc', true)).toBe('domestici');
    expect(agreeAdj('selvatico', 'masc', true)).toBe('selvatici');
    expect(agreeAdj('pratico', 'masc', true)).toBe('pratici');
    expect(agreeAdj('selvatico', 'fem', true)).toBe('selvatiche');
    expect(agreeAdj('antico', 'masc', true)).toBe('antichi');
  });

  test('-io does not double its i in the masculine plural', () => {
    expect(agreeAdj('vecchio', 'masc', true)).toBe('vecchi');
    expect(agreeAdj('vecchio', 'fem', true)).toBe('vecchie');
    expect(agreeAdj('vecchio', 'fem', false)).toBe('vecchia');
  });

  test('the -e class is gender-invariant, plural -i', () => {
    expect(agreeAdj('felice', 'masc', false)).toBe('felice');
    expect(agreeAdj('felice', 'fem', false)).toBe('felice');
    expect(agreeAdj('grande', 'masc', true)).toBe('grandi');
    expect(agreeAdj('grande', 'fem', true)).toBe('grandi');
  });

  test('any other ending is invariable', () => {
    expect(agreeAdj('blu', 'fem', true)).toBe('blu');
  });

  test('a multi-word adjective inflects its last word', () => {
    expect(agreeAdj('non collegato', 'fem', true)).toBe('non collegate');
  });

  test('an empty base stays empty', () => {
    expect(agreeAdj('', 'fem', true)).toBe('');
  });

  test('an invariable adjective keeps its base in every gender and number', () => {
    expect(agreeAdj('zero', 'fem', false)).toBe('zero');
    expect(agreeAdj('zero', 'masc', true)).toBe('zero');
    expect(agreeAdj('zero', 'fem', true)).toBe('zero');
  });
});
