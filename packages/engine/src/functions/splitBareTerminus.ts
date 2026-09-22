import type { ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement } from '../types.js';

/**
 * Split the complements into a bare-object addressee (`terminus`) and the rest, for a verb whose
 * lexeme says `terminus_bare`. English asks and answers a *person*, with no adposition: "asks the
 * man the name", "answers the man", where the shared `terminus` preposition would write "asks the
 * name to the man" and "answers to the man" — the second of which reads *is accountable to* (A238).
 *
 * The recipient leads the direct object, as the double-object construction orders them, so the
 * caller renders `bare` in the slot right after the verb and lets `rest` trail the object where the
 * shared render order puts it. A verb that does take "to" names no key and is untouched ("says the
 * word to the man"); German's own bare dative is `terminus_dative` and `splitDative`'s business.
 */
export function splitBareTerminus(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  verb: ConceptForms['forms'] = {},
): { bare?: ResolvedComplement; rest?: Partial<Record<ComplementType, ResolvedComplement>> } {
  const terminus = complements?.['terminus'];
  if (!terminus || verb['terminus_bare'] !== '1') return { rest: complements };
  const { terminus: _t, ...rest } = complements;
  return { bare: terminus, rest };
}
