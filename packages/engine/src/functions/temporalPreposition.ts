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

/**
 * Whether the `at` time is said with **no adposition at all**, as the bare noun phrase: Italian "la
 * mattina", "questa mattina", French "le matin", "ce matin", English "this morning", where a day
 * takes its "in", "en" or "on" (localization B80). The head noun's lexeme says so in
 * `temporal_bare`: `'1'` under every determiner, or a comma list of the determiners it is bare under
 * (English MORNING is `this,that`: "this morning", but "in the morning"). Read off the first
 * conjunct, as the preposition is. Only the engines whose lexemes seed the key read it (en, it, fr).
 */
export function temporalBare(c: ResolvedComplement): boolean {
  const forms = firstConjunct(c.phrase).head.forms;
  const bare = forms['temporal_bare'];
  if (!bare) return false;
  return bare === '1' || bare.split(',').includes(forms['definiteness'] ?? 'definite');
}
