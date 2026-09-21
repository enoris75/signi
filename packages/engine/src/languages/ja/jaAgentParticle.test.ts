import { describe, expect, test } from 'vitest';
import { complement, np } from '../resolved.fixtures.js';
import { jaAgentParticle } from './jaAgentParticle.js';

const CHILD = complement(np({ base: '子供' }));

describe('jaAgentParticle', () => {
  test('an agent takes に', () => {
    expect(jaAgentParticle()).toBe('に');
    expect(jaAgentParticle({ locative: CHILD })).toBe('に');
  });

  test('where a recipient or a factitive object complement already holds the に, the agent takes によって', () => {
    expect(jaAgentParticle({ terminus: CHILD })).toBe('によって');
    expect(jaAgentParticle({ objectPredicative: CHILD })).toBe('によって');
  });

  test('an essive object complement takes として, so it leaves the に to the agent', () => {
    expect(jaAgentParticle({ objectPredicative: complement(np({ base: '子供' }), [{ kind: 'predication', value: 'essive' }]) })).toBe('に');
  });
});
