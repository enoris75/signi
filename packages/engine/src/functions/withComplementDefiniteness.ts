import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../types.js';
import { withDefiniteness } from './withDefiniteness.js';

/**
 * The complements re-rendered with every `no`-determined conjunct under another determiner — the
 * complement-side twin of `withDefiniteness` on the object (A158). English passes `'any'` and German
 * `'indefinite'`, to avoid the double negative a second clause negator would make ("in no house" →
 * "in any house", "in keinem Haus" → "in einem Haus").
 *
 * The switch is **per conjunct**, as the object's already is: a group mixing determiners keeps the
 * ones that are not negative ("in the house or any market"). Complements with nothing negative in
 * them come back untouched.
 */
export function withComplementDefiniteness(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  definiteness: string,
): Partial<Record<ComplementType, ResolvedComplement>> | undefined {
  if (!complements) return complements;
  const entries = Object.entries(complements).map(([type, c]) => {
    if (!c) return [type, c] as const;
    const conjuncts = c.phrase.conjuncts.map((np) =>
      np.head.forms['definiteness'] === 'no' ? withDefiniteness(np, definiteness) : np);
    return [type, { ...c, phrase: { ...c.phrase, conjuncts } }] as const;
  });
  return Object.fromEntries(entries) as Partial<Record<ComplementType, ResolvedComplement>>;
}
