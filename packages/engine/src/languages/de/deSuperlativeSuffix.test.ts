import { describe, expect, test } from 'vitest';
import { deSuperlativeSuffix } from './deSuperlativeSuffix.js';

describe('deSuperlativeSuffix', () => {
  test('inserts an -e- after a stem ending in -d, -t, -s, -ß, -z or -sch', () => {
    expect(deSuperlativeSuffix('rund')).toBe('est');
    expect(deSuperlativeSuffix('kält')).toBe('est');
    expect(deSuperlativeSuffix('blass')).toBe('est');
    expect(deSuperlativeSuffix('heiß')).toBe('est');
    expect(deSuperlativeSuffix('kürz')).toBe('est');
    expect(deSuperlativeSuffix('hübsch')).toBe('est');
  });

  // Only a stressed root does: a monosyllabic -sch keeps it.
  test('takes a bare -st after an unstressed -isch or a participle\'s -end', () => {
    expect(deSuperlativeSuffix('semantisch')).toBe('st');
    expect(deSuperlativeSuffix('typisch')).toBe('st');
    expect(deSuperlativeSuffix('spannend')).toBe('st');
    expect(deSuperlativeSuffix('frisch')).toBe('est');
  });

  test('takes a bare -st elsewhere', () => {
    expect(deSuperlativeSuffix('jüng')).toBe('st');
    expect(deSuperlativeSuffix('schnell')).toBe('st');
    expect(deSuperlativeSuffix('müde')).toBe('st');
  });
});
