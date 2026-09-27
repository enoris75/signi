import { describe, expect, test } from 'vitest';
import { adj, ALT, BO, el, MANERA, np, VELOCITAT } from './ca.fixtures.js';
import { mannerGloss } from './mannerGloss.js';

describe('mannerGloss', () => {
  test('the manner noun phrase under its adposition, keeping its determiner', () => {
    expect(mannerGloss(el(np(VELOCITAT, { definiteness: 'bare' }, { adjectives: [adj(ALT)], mannerGloss: true })))).toBe('a velocitat alta');
    expect(mannerGloss(el(np(MANERA, { definiteness: 'indefinite' }, { adjectives: [adj(BO)], mannerGloss: true })))).toBe("d'una manera bona");
  });
});
