import { describe, expect, test } from 'vitest';
import { CHAT, FEMME, group, JE, np } from './fr.fixtures.js';
import { agreeParticipleFr } from './agreeParticipleFr.js';

describe('agreeParticipleFr', () => {
  test('a masculine singular subject leaves the participle bare', () => {
    expect(agreeParticipleFr('allé', CHAT)).toBe('allé');
    expect(agreeParticipleFr('venu', JE)).toBe('venu');
  });

  test('adds -e for a feminine and -s for a plural subject', () => {
    expect(agreeParticipleFr('allé', FEMME)).toBe('allée');
    expect(agreeParticipleFr('devenu', { ...CHAT, number: 'plural' })).toBe('devenus');
    expect(agreeParticipleFr('venu', { ...FEMME, number: 'plural' })).toBe('venues');
  });

  test('a mixed "and" group agrees in the masculine plural', () => {
    const agreement = group('and', np(FEMME), np(CHAT)).agreement;
    expect(agreeParticipleFr('allé', agreement)).toBe('allés');
  });

  test('an empty participle stays empty', () => {
    expect(agreeParticipleFr('', FEMME)).toBe('');
  });
});
