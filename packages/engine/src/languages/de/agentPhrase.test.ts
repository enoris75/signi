import { describe, expect, test } from 'vitest';
import { adj, el, GROSS, ICH, JUNGE, KATER, KATZE, np, VERWANDT } from './de.fixtures.js';
import { agentPhrase } from './agentPhrase.js';

describe('agentPhrase', () => {
  test('is empty with no agent to speak', () => {
    expect(agentPhrase()).toBe('');
  });

  test('"von" + the dative, fused with the masculine/neuter article', () => {
    expect(agentPhrase(el(np(KATZE)))).toBe('von der Katze');
    expect(agentPhrase(el(np(KATER)))).toBe('vom Kater');
    expect(agentPhrase(el(np(KATER, { definiteness: 'indefinite' })))).toBe('von einem Kater');
  });

  test('the preposition and determiner repeat across a coordination', () => {
    expect(agentPhrase(el(np(KATZE), np(KATER)))).toBe('von der Katze und vom Kater');
  });

  test('a pronoun takes its dative tonic form', () => {
    expect(agentPhrase(el(np(ICH)))).toBe('von mir');
  });

  test('a weak masculine declines to -(e)n in the oblique', () => {
    expect(agentPhrase(el(np(JUNGE)))).toBe('vom Jungen');
  });

  test('the plural takes the dative -n, and the adjectives decline after the determiner', () => {
    expect(agentPhrase(el(np(KATER, { number: 'plural' }, { adjectives: [adj(GROSS)] })))).toBe('von den großen Katern');
  });

  test('a possessive is an ein-word in place of the article', () => {
    const my = { kind: 'pronominal', person: '1', number: 'singular' } as const;
    expect(agentPhrase(el(np(KATER, {}, { possessor: my, adjectives: [adj(GROSS)] })))).toBe('von meinem großen Kater');
  });

  // P11 D8: the adjectival noun takes its adjective ending here too, not the noun rules.
  test('an adjectival noun declines like an adjective', () => {
    expect(agentPhrase(el(np(VERWANDT)))).toBe('vom Verwandten');
    expect(agentPhrase(el(np(VERWANDT, { definiteness: 'indefinite' })))).toBe('von einem Verwandten');
    expect(agentPhrase(el(np(VERWANDT, { number: 'plural' })))).toBe('von den Verwandten');
    expect(agentPhrase(el(np(VERWANDT, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }))))
      .toBe('von meinem Verwandten');
  });
});
