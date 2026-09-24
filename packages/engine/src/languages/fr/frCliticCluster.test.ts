import { describe, expect, test } from 'vitest';
import { frCliticCluster } from './frCliticCluster.js';

describe('frCliticCluster', () => {
  test('lui and leur follow the object', () => {
    expect(frCliticCluster('lui', 'le')).toBe('le lui');
    expect(frCliticCluster('leur', 'les')).toBe('les leur');
  });

  test('me, te, nous and vous precede it', () => {
    expect(['me', 'te', 'nous', 'vous'].map((d) => frCliticCluster(d, 'la'))).toEqual(['me la', 'te la', 'nous la', 'vous la']);
  });

  test('a lone clitic is returned as it is', () => {
    expect(frCliticCluster('lui', '')).toBe('lui');
    expect(frCliticCluster('', 'le')).toBe('le');
  });
});
