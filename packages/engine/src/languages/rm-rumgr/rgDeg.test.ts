import { describe, expect, test } from 'vitest';
import { GROND, adj } from './rumgr.fixtures.js';
import { rgDeg } from './rgDeg.js';

describe('rgDeg', () => {
  test('pli, main, uschè before the agreed adjective', () => {
    expect(rgDeg(adj(GROND), 'grond')).toBe('grond');
    expect(rgDeg(adj(GROND, { degree: 'more' }), 'gronda')).toBe('pli gronda');
    expect(rgDeg(adj(GROND, { degree: 'most' }), 'grond')).toBe('pli grond');
    expect(rgDeg(adj(GROND, { degree: 'less' }), 'grond')).toBe('main grond');
    expect(rgDeg(adj(GROND, { degree: 'equally' }), 'grond')).toBe('uschè grond');
  });
});
