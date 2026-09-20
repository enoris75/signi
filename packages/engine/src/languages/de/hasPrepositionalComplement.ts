import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../../types.js';
import { abstractionLevel } from '../../functions/abstractionLevel.js';
import { firstConjunct } from '../../functions/firstConjunct.js';

/**
 * Does any complement render as a **prepositional phrase** (A159)? German sentence negation puts
 * "nicht" after the objects but *before* a constituent that belongs to the predicate, and a
 * prepositional complement is one: "geht nicht zum Markt", never "*geht zum Markt nicht".
 *
 * "Is a PP" is not a property of the complement *type* — `complementsPhrase` gives direction "zu",
 * source "von"/"aus", instrumental "mit", cause "wegen"/"dank", locative/route a spatial
 * preposition, and an inanimate terminus "in" or the verb's own — so the three that do **not**
 * carry one are named here and everything else does:
 *
 * - `predicative` is a bare nominative ("ist eine Legende", "wird müde"). "nicht" leads it too, but
 *   for its own reason, so the caller asks for it separately;
 * - an **animate** `terminus` is the bare dative recipient ("gibt dem Hund das Buch"), which is an
 *   object and keeps "nicht" after it;
 * - a `process` `instrumental` is a subordinate means clause in the Nachfeld ("beginnt, indem man
 *   ein Wort wählt") — behind the verb entirely, so it is not what "nicht" would lead.
 *
 * The last two are the ones `splitDative` / `splitMeansClause` lift out of the complements slot;
 * naming them here keeps the answer right whether or not the caller has split yet.
 *
 * The `objectPredicative` is not among the three, deliberately: it is a PP under a factitive link
 * ("in ein Gefängnis") or the essive "als", and where a verb names no link it is a bare predicate,
 * which "nicht" leads for the same reason a subject complement's does ("macht das Haus nicht …").
 */
export function hasPrepositionalComplement(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): boolean {
  if (!complements) return false;
  return Object.entries(complements).some(([type, c]) => !!c && isPrepositional(type as ComplementType, c));
}

function isPrepositional(type: ComplementType, c: ResolvedComplement): boolean {
  if (type === 'predicative') return false;
  if (type === 'terminus') return firstConjunct(c.phrase).head.forms['animate'] !== '1';
  if (type === 'instrumental') return !(c.action && abstractionLevel(c) === 'process');
  return true;
}
