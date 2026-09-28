import { describe, expect, test } from 'vitest';
import type { ResolvedNounElement, ResolvedVerbPhrase } from '../../types.js';
import { clauseNegation } from './clauseNegation.js';
import { cf } from './lt.fixtures.js';

const vp = (extra: Partial<ResolvedVerbPhrase> = {}): ResolvedVerbPhrase => ({ verb: cf('EAT'), modals: [], ...extra });
const el = (id: string, extra: Record<string, string> = {}): ResolvedNounElement => {
  const head = cf(id, extra);
  return { conjuncts: [{ head, adjectives: [], nounModifiers: [] }], agreement: head.forms };
};

describe('clauseNegation', () => {
  test('the plain negation', () => {
    expect(clauseNegation({ verbPhrase: vp({ negative: true }) })).toEqual({ finite: true, inner: false });
    expect(clauseNegation({ verbPhrase: vp() })).toEqual({ finite: false, inner: false });
  });

  test('negative concord: niekada, a negative subject, a joks object', () => {
    expect(clauseNegation({ verbPhrase: vp({ modifier: cf('NEVER') }) }).finite).toBe(true);
    expect(clauseNegation({ verbPhrase: vp(), subjectNegative: true }).finite).toBe(true);
    expect(clauseNegation({ verbPhrase: vp(), directObject: el('MOUSE', { definiteness: 'no' }) }).finite).toBe(true);
  });

  test('a governed negation takes the concord inside', () => {
    const governed = vp({ modals: [{ verb: cf('WILL') }], governedNegative: true });
    expect(clauseNegation({ verbPhrase: governed, directObject: el('MOUSE', { definiteness: 'no' }) })).toEqual({ finite: false, inner: true });
  });
});
