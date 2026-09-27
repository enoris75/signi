import { describe, expect, test } from 'vitest';
import type { PhrasePlan } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounPhrase } from '../../types.js';
import { LOOKUP } from '../translator.fixtures.js';
import { predicativePosition } from './predicativePosition.js';
import { resolvePhrase } from './resolvePhrase.js';

const head = (conceptId: string, role: string): ResolvedNounPhrase =>
  ({ head: { conceptId, forms: { base: conceptId.toLowerCase(), role } }, adjectives: [] } as unknown as ResolvedNounPhrase);
const predicative = (...conjuncts: ResolvedNounPhrase[]): { predicative: ResolvedComplement } =>
  ({ predicative: { phrase: { conjuncts, agreement: {}, ...(conjuncts.length > 1 ? { conjunction: 'and' as const } : {}) } } });
const positions = (c: ReturnType<typeof predicativePosition>) => c?.predicative?.phrase.conjuncts.map((np) => np.head.position);

describe('predicativePosition (P04-E9 D1)', () => {
  test('flags the adjective a copula predicates', () => {
    expect(positions(predicativePosition(predicative(head('GOOD', 'adjective')), 'BE'))).toEqual(['predicative']);
  });

  test('flags the adjective BECOME predicates', () => {
    expect(positions(predicativePosition(predicative(head('BIG', 'adjective')), 'BECOME'))).toEqual(['predicative']);
  });

  test('flags each adjective of a coordinated predicate, and never a noun', () => {
    expect(positions(predicativePosition(predicative(head('GOOD', 'adjective'), head('CAT', 'noun')), 'BE'))).toEqual(['predicative', undefined]);
  });

  test('leaves SEEM and every other verb unflagged (E9 D2\'s open points)', () => {
    expect(positions(predicativePosition(predicative(head('BIG', 'adjective')), 'SEEM'))).toEqual([undefined]);
    expect(positions(predicativePosition(predicative(head('BIG', 'adjective')), 'BE_FARING'))).toEqual([undefined]);
    expect(positions(predicativePosition(predicative(head('BIG', 'adjective')), undefined))).toEqual([undefined]);
  });

  test('leaves the predicate of a clausal subject unflagged — the impersonal', () => {
    expect(positions(predicativePosition(predicative(head('GOOD', 'adjective')), 'BE', true))).toEqual([undefined]);
  });

  test('flags only the predicative complement, and copies rather than mutates', () => {
    const adjective = head('GOOD', 'adjective');
    const complements = { ...predicative(adjective), locative: { phrase: { conjuncts: [head('HOUSE', 'noun')], agreement: {} } } };
    const out = predicativePosition(complements, 'BE')!;
    expect(out.locative).toBe(complements.locative);
    expect(adjective.head.position).toBeUndefined();
    expect(predicativePosition(undefined, 'BE')).toBeUndefined();
  });

  test('is set by the translator on a copula clause, and on nothing else in it', () => {
    const plan: PhrasePlan = { subject: { concept: 'CAT', adjectives: ['BIG'] }, verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: { concept: 'HAPPY' } } } };
    const resolved = resolvePhrase(plan, 'it', LOOKUP);
    expect(resolved.complements?.predicative?.phrase.conjuncts[0]!.head.position).toBe('predicative');
    expect(resolved.subject.conjuncts[0]!.adjectives.map((a) => a.position)).toEqual([undefined]);
    expect(resolved.subject.conjuncts[0]!.head.position).toBeUndefined();
  });
});
