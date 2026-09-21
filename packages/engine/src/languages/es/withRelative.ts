import type { ResolvedNounPhrase } from '../../types.js';
import { isGenericSubject } from '../../functions/isGenericSubject.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { relativeAgentGap } from '../../functions/relativeAgentGap.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativePossessed } from '../../functions/relativePossessed.js';
import { relativePrepositionalHead } from '../../functions/relativePrepositionalHead.js';
import { agentPhrase } from './agentPhrase.js';
import { complementsPhrase } from './complementsPhrase.js';
import { modifierText } from './modifierText.js';
import { possessorText } from './possessorText.js';
import { isPlural } from './isPlural.js';
import { predicateText } from './predicateText.js';
import { prepObjectText } from './prepObjectText.js';
import { subjectText } from './subjectText.js';

/**
 * Append a noun phrase's attributive nouns, possessor, and relative clause (invariant
 * "que" + predicate). A subject-relative agrees with the head ("el niño que llora"); an
 * object-relative carries the clause's own subject, which drives agreement ("el libro que yo leo").
 * When the head fills a complement, the relativizer is that complement's preposition with the
 * article and "que", agreeing with the head ("la casa debajo de la que el gato come", "el niño al que el hombre da el libro").
 * A plain locative gap is the relative adverb "donde" instead ("un lugar donde se vive", C07). A possessor gap is the genitive relative
 * "cuyo", which agrees with the possessed noun and takes the place of its article
 * ("un período cuyo sustantivo es una palabra"). A passive's agent gap is "por el que" ("el niño por el
 * que el libro es escrito"); its other gaps carry the agent after the participle ("el libro que es
 * escrito por el niño").
 */
export function withRelative(text: string, np: ResolvedNounPhrase): string {
  const withPoss = `${text}${modifierText(np)}${possessorText(np)}`;
  const rel = np.relative;
  if (!rel) return withPoss;
  // Genitive relative: "cuyo" replaces the possessed phrase's article and agrees with it, not
  // with the head — "un período cuyo sustantivo es una palabra", and so does the clause's verb.
  const possessed = relativePossessed(rel);
  if (possessed) {
    const pf = firstConjunct(possessed).head.forms;
    const whose = `cuy${pf['gender'] === 'fem' ? 'a' : 'o'}${isPlural(pf) ? 's' : ''}`;
    const owned = [whose, subjectText(possessed),
      predicateText(possessed.agreement, rel.verbPhrase, rel.directObject, rel.complements)];
    return `${withPoss} ${owned.filter(Boolean).join(' ')}`.trimEnd();
  }
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const QUE = { base: 'que', plural: 'que', definiteness: 'definite' };
  // The object of a verb that takes it with a preposition relativises on that preposition, as a
  // complement does: "el botón en el que el gato clica" (A139).
  const prepHead = relativePrepositionalHead(np, QUE);
  // A plural head gapped as the object of the impersonal se is the passive se's patient, and the verb
  // agrees with it: "los ratones que se comen".
  const passiveSe = !subjectRelative && rel.headRole === 'directObject' && !prepHead && isGenericSubject(rel.subject!)
    && (np.head.forms['number'] ?? np.head.forms['count']) === 'plural';
  const agreeForms = subjectRelative ? np.head.forms
    : passiveSe ? { ...rel.subject!.agreement, number: 'plural' } : rel.subject!.agreement;
  // An impersonal ("se") subject is emitted as a proclitic by predicateText (off the generic flag
  // on agreeForms), not as a subject word — "una cosa que se come".
  const subjText = subjectRelative || isGenericSubject(rel.subject!) ? '' : subjectText(rel.subject!);
  const clause = predicateText(agreeForms, rel.verbPhrase, rel.directObject, rel.complements, rel.agent);
  const gap = relativeGapComplement(np, QUE);
  const agentGap = relativeAgentGap(np, QUE);
  const relativizer = agentGap ? agentPhrase(agentGap)
    : prepHead ? prepObjectText(prepHead.head, prepHead.prep)
    : isPlainLocativeGap(rel) ? 'donde' : gap ? complementsPhrase(gap, {}, '') : 'que';
  return `${withPoss} ${relativizer} ${[subjText, clause].filter(Boolean).join(' ')}`.trimEnd();
}
