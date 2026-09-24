import { describe, expect, test } from 'vitest';
import { itCliticCluster } from './itCliticCluster.js';

describe('itCliticCluster', () => {
  test('the 3rd-person dative is glie, fused with the object', () => {
    expect(['lo', 'la', 'li', 'le'].map((o) => itCliticCluster('gli', o))).toEqual(['glielo', 'gliela', 'glieli', 'gliele']);
    expect(itCliticCluster('le', 'lo')).toBe('glielo');
  });

  test('mi / ti / ci / vi take -e before the object', () => {
    expect(['mi', 'ti', 'ci', 'vi'].map((d) => itCliticCluster(d, 'lo'))).toEqual(['me lo', 'te lo', 'ce lo', 've lo']);
  });

  test('a lone clitic is returned as it is', () => {
    expect(itCliticCluster('gli', '')).toBe('gli');
    expect(itCliticCluster('', 'lo')).toBe('lo');
  });
});
