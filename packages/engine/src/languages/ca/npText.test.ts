import { describe, expect, test } from 'vitest';
import { adj, CASA, GAT, HOME, NEGRE, np } from './ca.fixtures.js';
import { npText } from './npText.js';

describe('npText', () => {
  test('a finished noun phrase: its determiner, adjectives and possessive', () => {
    expect(npText(np(GAT, {}, { adjectives: [adj(NEGRE)] }))).toBe('el gat negre');
    expect(npText(np(CASA, {}, { possessor: { kind: 'pronominal', person: '2', number: 'singular' } }))).toBe('la teva casa');
  });

  test('a genitive possessor follows, contracted', () => {
    expect(npText(np(CASA, {}, { possessor: np(GAT) }))).toBe('la casa del gat');
    expect(npText(np(CASA, {}, { possessor: np(HOME) }))).toBe("la casa de l'home");
  });
});
