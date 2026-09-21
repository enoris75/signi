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

  // A194. A participle already ending in -s has no separate masculine plural, exactly as
  // agreeAdjFr's mauvais/heureux do: compris, inclus, acquis stay put. The feminine is regular,
  // because the -e comes between the two.
  test('a participle in -s is invariable in the masculine plural', () => {
    const masculinePlural = { ...CHAT, number: 'plural' };
    expect(agreeParticipleFr('compris', masculinePlural)).toBe('compris');
    expect(agreeParticipleFr('inclus', masculinePlural)).toBe('inclus');
    expect(agreeParticipleFr('acquis', masculinePlural)).toBe('acquis');
    expect(agreeParticipleFr('compris', CHAT)).toBe('compris');
    expect(agreeParticipleFr('compris', FEMME)).toBe('comprise');
    expect(agreeParticipleFr('compris', { ...FEMME, number: 'plural' })).toBe('comprises');
  });

  // No seeded participle ends in -x or -z, so this guard is unobserved in the corpus; it is here
  // because the invariability is the same rule for every French sibilant (vieux, doux, nez).
  test('so is one in -x or -z', () => {
    expect(agreeParticipleFr('faux', { ...CHAT, number: 'plural' })).toBe('faux');
    expect(agreeParticipleFr('assez', { ...CHAT, number: 'plural' })).toBe('assez');
  });
});
