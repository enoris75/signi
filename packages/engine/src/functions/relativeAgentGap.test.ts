import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../types.js';
import { el, np, vp } from '../languages/resolved.fixtures.js';
import { relativeAgentGap } from './relativeAgentGap.js';

const CHILD = { base: 'child', human: '1' };
const WHOM = { base: 'whom' };
const clause = (headRole: ResolvedRelativeClause['headRole']): ResolvedRelativeClause =>
  ({ headRole, subject: el(np({ base: 'book' })), verbPhrase: vp({ base: 'write' }, { voice: 'passive' }) });

describe('relativeAgentGap', () => {
  test('a phrase with no relative clause has no agent gap', () => {
    expect(relativeAgentGap(np(CHILD), WHOM)).toBeUndefined();
  });

  test.each(['subject', 'directObject', 'possessor', 'locative'] as const)('a %s gap is no agent gap', (headRole) => {
    expect(relativeAgentGap(np(CHILD, {}, { relative: clause(headRole) }), WHOM)).toBeUndefined();
  });

  test('an agent gap is a relativizer stand-in for the head', () => {
    expect(relativeAgentGap(np(CHILD, {}, { relative: clause('agent') }), WHOM)?.agreement).toStrictEqual({ human: '1', base: 'whom' });
  });
});
