import type { ResolvedComplement } from '../types.js';
import { firstConjunct } from './firstConjunct.js';

/**
 * The adposition a `temporal` complement's head noun takes for the `at` relation — the one relation
 * whose word the noun picks rather than the relation itself. English is *on* a day, *at* a time,
 * *in* a week; German *an* dem Tag, *zu* der Zeit, *in* der Woche. A lexeme that names none falls
 * back on the language's generic time preposition, which the caller supplies (C29).
 *
 * Read off the first conjunct, as `mannerRelation` is: the preposition is emitted once, before the
 * whole group, so a coordination takes the head noun's word ("on this day and this night").
 */
export function temporalPreposition<T extends string>(c: ResolvedComplement, fallback: T): T {
  return (firstConjunct(c.phrase).head.forms['temporal_prep'] as T | undefined) ?? fallback;
}
