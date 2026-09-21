import type { ResolvedNounPhrase } from '../types.js';
import { isGenericSubject } from './isGenericSubject.js';
import { isPronounElement } from './isPronounElement.js';

/**
 * Whether a pro-drop relative clause (Italian, Spanish, Portuguese) leaves its pronoun subject unsaid,
 * the verb ending alone carrying the person, as A40's main clause does: "il libro che leggo", "el libro
 * que leemos", "la casa dove mangio" (A173). Only a single pronoun drops. A noun, a coordination ("che
 * io e lui leggiamo") and the impersonal subject, which is written as a clitic, are not dropped here. A
 * subject relative has no subject of its own, and a genitive relative's is the possessed noun.
 *
 * One drop is withheld: the one that would let the clause read as a subject relative. That happens
 * after the bare complementizer (`complementizer`: "che", "que"), which does not mark where the gap
 * is, when the predicate rendered with the pronoun's agreement is the very string rendered with the
 * head's. "il gatto che lui vede" would become "il gatto che vede", "the cat that sees", so it keeps
 * "lui". So do Portuguese "o livro que você mostra" and a form shared across persons ("el libro que yo
 * leería", "il libro che io legga"). A verb whose number differs from the head's already marks another
 * subject ("i gatti che vede"), and a relativizer that marks the gap itself ("dove", "nella quale",
 * "donde") leaves no subject-relative reading, so both drop.
 *
 * `predicate` renders the relative's predicate under the given agreement forms, as the engine's
 * relative builder does. Comparing the rendered strings, rather than person and number, catches a
 * syncretic form in every tense and mood.
 */
export function relativeDropsSubject(
  np: ResolvedNounPhrase,
  complementizer: boolean,
  predicate: (agreement: Record<string, string>) => string,
): boolean {
  const rel = np.relative;
  if (!rel?.subject || rel.headRole === 'subject' || rel.headRole === 'possessor') return false;
  if (!isPronounElement(rel.subject) || isGenericSubject(rel.subject)) return false;
  return !complementizer || predicate(rel.subject.agreement) !== predicate(np.head.forms);
}
