import type { ResolvedRelativeClause } from '../types.js';
import { isGenericSubject } from './isGenericSubject.js';
import { relativeSubjectIsNegative } from './relativeSubjectIsNegative.js';

/** The gaps whose relativizer is no complement's: they relativise with "che" / "que" or a possessive. */
const NOT_A_COMPLEMENT_GAP = new Set(['subject', 'directObject', 'possessor', 'agent', 'predicative', 'objectPredicative']);

/**
 * Whether a relative clause gapped on a complement — a place ("where", it *dove*, fr *où*) or a marked
 * relation ("under which", *sotto la quale*, *sous laquelle*) — is the **bare copula** after a **noun**
 * subject: BE with no object, no complement, no pro-form and no adverb, affirmative, in a simple tense
 * and under no modal. Italian and French put the verb first there, *dov'è il gatto*, *où est le chat*
 * (A221): with nothing after it a clause-final "è" / "est" reads as unfinished, and in the subject slot
 * it runs into the matrix verb (*la casa dove il gatto è brucia*).
 *
 * Everything else keeps the statement's order: another verb, a predicate, a pronoun subject (a French
 * clitic never inverts this way, and an Italian one is dropped), the generic subject (*dove si è*, *où
 * l'on est*), a negative (*où le chat n'est pas*) and the compound tenses and modals, whose verb group
 * does not end on the copula alone.
 */
export function relativeInvertsCopula(rel: ResolvedRelativeClause): boolean {
  const { subject, verbPhrase: vp } = rel;
  if (!subject || NOT_A_COMPLEMENT_GAP.has(rel.headRole)) return false;
  const bare = vp.verb.conceptId === 'BE' && !rel.directObject && !rel.agent && !vp.elided && !vp.modifier
    && Object.keys(rel.complements ?? {}).length === 0;
  const simple = (vp.aspect ?? 'neutral') === 'neutral' && vp.modals.length === 0;
  const affirmative = !vp.negative && !relativeSubjectIsNegative(rel);
  const noun = !isGenericSubject(subject) && subject.conjuncts.every((np) => !np.head.forms['person']);
  return bare && simple && affirmative && noun;
}
