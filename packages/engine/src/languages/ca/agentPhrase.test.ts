import { describe, expect, test } from 'vitest';
import { el, GAT, GOS, HOME, JO, np } from './ca.fixtures.js';
import { agentPhrase } from './agentPhrase.js';

describe('agentPhrase', () => {
  test('per, contracting with each conjunct\'s article', () => {
    expect(agentPhrase(el(np(GAT)))).toBe('pel gat');
    expect(agentPhrase(el(np(GAT), np(GOS)))).toBe('pel gat i pel gos');
    expect(agentPhrase(el(np(HOME)))).toBe("per l'home");
  });

  test('a pronoun takes its tonic form', () => {
    expect(agentPhrase(el(np(JO)))).toBe('per mi');
  });

  test('nothing without an agent', () => {
    expect(agentPhrase(undefined)).toBe('');
  });
});
