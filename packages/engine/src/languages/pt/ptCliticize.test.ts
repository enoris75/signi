import { describe, expect, test } from 'vitest';
import { ptCliticize } from './ptCliticize.js';

describe('ptCliticize', () => {
  test('is a no-op without a clitic', () => {
    expect(ptCliticize('', 'vê')).toBe('vê');
    expect(ptCliticize('', 'não vê')).toBe('não vê');
  });

  test('puts the clitic before the verb (Brazilian proclisis)', () => {
    expect(ptCliticize('me', 'vê')).toBe('me vê');
    expect(ptCliticize('os', 'viu')).toBe('os viu');
  });

  test('slots the clitic in after a leading "não"', () => {
    expect(ptCliticize('me', 'não vê')).toBe('não me vê');
    expect(ptCliticize('a', 'não comerá')).toBe('não a comerá');
  });
});
