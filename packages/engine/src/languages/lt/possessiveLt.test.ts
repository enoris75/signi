import { describe, expect, test } from 'vitest';
import { possessiveLt } from './possessiveLt.js';

describe('possessiveLt', () => {
  test('mano / tavo / mūsų / jūsų, indeclinable', () => {
    expect(possessiveLt({ kind: 'pronominal', person: '1', number: 'singular' })).toBe('mano');
    expect(possessiveLt({ kind: 'pronominal', person: '2', number: 'singular' })).toBe('tavo');
    expect(possessiveLt({ kind: 'pronominal', person: '1', number: 'plural' })).toBe('mūsų');
    expect(possessiveLt({ kind: 'pronominal', person: '2', number: 'plural' })).toBe('jūsų');
  });

  test('jo / jos / jų', () => {
    expect(possessiveLt({ kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' })).toBe('jo');
    expect(possessiveLt({ kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' })).toBe('jos');
    expect(possessiveLt({ kind: 'pronominal', person: '3', number: 'plural', gender: 'fem' })).toBe('jų');
  });

  test('the subject\'s own is savo, whatever the person', () => {
    expect(possessiveLt({ kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' }, true)).toBe('savo');
    expect(possessiveLt({ kind: 'pronominal', person: '1', number: 'singular' }, true)).toBe('savo');
  });
});
