import { describe, expect, test } from 'vitest';
import { esCliticCluster } from './esCliticCluster.js';

describe('esCliticCluster', () => {
  test('le and les are se before the object', () => {
    expect(esCliticCluster('le', 'lo')).toBe('se lo');
    expect(esCliticCluster('les', 'las')).toBe('se las');
  });

  test('the 1st and 2nd person dative leads the object unchanged', () => {
    expect(['me', 'te', 'nos', 'os'].map((d) => esCliticCluster(d, 'lo'))).toEqual(['me lo', 'te lo', 'nos lo', 'os lo']);
  });

  test('a lone clitic is returned as it is', () => {
    expect(esCliticCluster('le', '')).toBe('le');
    expect(esCliticCluster('', 'lo')).toBe('lo');
  });
});
