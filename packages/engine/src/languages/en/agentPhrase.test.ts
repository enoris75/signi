import { describe, expect, test } from 'vitest';
import { agentPhrase } from './agentPhrase.js';
import { CAT, el, HE, I, np, WE, YOU } from './en.fixtures.js';

describe('agentPhrase', () => {
  test('is empty with no agent', () => {
    expect(agentPhrase()).toBe('');
  });

  test('a noun agent keeps its determiner, and "by" leads the whole group', () => {
    expect(agentPhrase(el(np(CAT)))).toBe('by the cat');
    expect(agentPhrase(el(np(CAT), np(HE)))).toBe('by the cat and him');
  });

  test('a pronoun agent takes its object form', () => {
    expect(agentPhrase(el(np(I)))).toBe('by me');
    expect(agentPhrase(el(np(I)), CAT)).toBe('by me');
    expect(agentPhrase(el(np(WE)), I)).toBe('by us');
    expect(agentPhrase(el(np(HE)), HE)).toBe('by him');
  });

  // A177: the agent that is the subject itself, as the active object is.
  test('an agent with the subject’s 1st or 2nd person and number is reflexive, per conjunct', () => {
    expect(agentPhrase(el(np(I)), I)).toBe('by myself');
    expect(agentPhrase(el(np(WE)), WE)).toBe('by ourselves');
    expect(agentPhrase(el(np(YOU)), YOU)).toBe('by yourself');
    expect(agentPhrase(el(np(I), np(CAT)), I)).toBe('by myself and the cat');
  });
});
