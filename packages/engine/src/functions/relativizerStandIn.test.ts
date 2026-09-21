import { describe, expect, test } from 'vitest';
import { adj, np } from '../languages/resolved.fixtures.js';
import { relativizerStandIn } from './relativizerStandIn.js';

describe('relativizerStandIn', () => {
  test('is the relativizer word on the head’s agreement, and nothing else of the head', () => {
    const child = np({ base: 'child', plural: 'children', gender: 'masc', human: '1', proper: '1' }, {}, { adjectives: [adj({ base: 'small' })] });
    const forms = { gender: 'masc', human: '1', base: 'whom' };
    expect(relativizerStandIn(child, { base: 'whom' })).toStrictEqual({
      conjuncts: [{ head: { conceptId: '', forms }, adjectives: [], nounModifiers: [] }],
      agreement: forms,
    });
  });

  test("the relativizer's forms win over the head's", () => {
    expect(relativizerStandIn(np({ base: 'house', number: 'singular' }), { base: 'que', number: 'plural' }).agreement['number']).toBe('plural');
  });
});
