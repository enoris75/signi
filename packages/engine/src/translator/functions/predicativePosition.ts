import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../../types.js';

/**
 * The verbs whose `predicative` complement is a **predicate** in the sense P04-E9 needs: the copula
 * and BECOME (E9 D2, "copula and BECOME for certain"). SEEM and the object predicative are open points
 * for the Sursilvan reviewer (E9 D2) and are left unflagged — their adjective renders attributive.
 */
export const PREDICATE_VERBS: ReadonlySet<string> = new Set(['BE', 'BECOME']);

/**
 * Mark the adjectives a copula or BECOME predicates of its subject with `position: 'predicative'`
 * (P04-E9 D1): "the bread is **good**", "the cat becomes **big**". Every language gets the flag and only
 * Sursilvan reads it (*il paun ei buns*, against the attributive *in paun bun*); the other engines
 * render exactly what they did.
 *
 * `impersonal` is a clause standing as the subject ("it is **good** that one acts"): its predicate is
 * said of no noun, so it stays unflagged — whether Sursilvan's impersonal *ei ei bun* takes the *-s* is
 * E9 D2's open point, rendered with the bare form. A noun, a pronoun or a superlative in the predicate
 * is not an adjective and is never flagged. Returns the complements unchanged where nothing applies,
 * else a copy — the resolved adjective is never mutated in place.
 */
export function predicativePosition(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  verbConceptId: string | undefined,
  impersonal = false,
): Partial<Record<ComplementType, ResolvedComplement>> | undefined {
  const predicative = complements?.predicative;
  if (!predicative || impersonal || !verbConceptId || !PREDICATE_VERBS.has(verbConceptId)) return complements;
  const conjuncts = predicative.phrase.conjuncts.map((np) =>
    np.head.forms['role'] === 'adjective' ? { ...np, head: { ...np.head, position: 'predicative' as const } } : np);
  return { ...complements, predicative: { ...predicative, phrase: { ...predicative.phrase, conjuncts } } };
}
