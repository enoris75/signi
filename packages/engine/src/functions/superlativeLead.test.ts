import { describe, expect, test } from 'vitest';
import { adj } from '../languages/resolved.fixtures.js';
import { superlativeLead } from './superlativeLead.js';

const BIG = { base: 'grande' };

describe('superlativeLead', () => {
  test('a superlative intensifier comes off the adjective', () => {
    const a = adj(BIG, {
      degree: 'most', intensifier: 'di gran lunga', intensifier_position: 'pre', intensifier_superlative: '1',
    });
    const { lead, adjective } = superlativeLead(a);
    expect(lead).toBe('di gran lunga');
    expect(adjective.forms).toEqual({ base: 'grande', degree: 'most' });
    // …without touching the adjective it was given.
    expect(a.forms['intensifier']).toBe('di gran lunga');
  });

  test('a plain intensifier, or none, stays where it is', () => {
    const plain = adj(BIG, { degree: 'most', intensifier: 'very', intensifier_position: 'pre' });
    expect(superlativeLead(plain)).toEqual({ lead: '', adjective: plain });
    const bare = adj(BIG, { degree: 'most' });
    expect(superlativeLead(bare)).toEqual({ lead: '', adjective: bare });
  });
});
