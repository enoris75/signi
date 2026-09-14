import type { ResolvedNounPhrase } from '../../types.js';
import { isGenericSubject } from '../../functions/isGenericSubject.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativePrepositionalHead } from '../../functions/relativePrepositionalHead.js';
import { complementsPhrase } from './complementsPhrase.js';
import { modifierText } from './modifierText.js';
import { possessorText } from './possessorText.js';
import { predicateText } from './predicateText.js';
import { prepObjectText } from './prepObjectText.js';
import { subjectText } from './subjectText.js';

/**
 * Append a noun phrase's attributive nouns, possessor, and relative clause (invariant
 * "que" + predicate). A subject-relative agrees with the head ("el niño que llora"); an
 * object-relative carries the clause's own subject, which drives agreement ("el libro que yo leo").
 * When the head fills a complement, the relativizer is that complement's preposition with the
 * article and "que", agreeing with the head ("la casa debajo de la que el gato come", "el niño al que el hombre da el libro").
 * A plain locative gap is the relative adverb "donde" instead ("un lugar donde se vive", C07).
 */
export function withRelative(text: string, np: ResolvedNounPhrase): string {
  const withPoss = `${text}${modifierText(np)}${possessorText(np)}`;
  const rel = np.relative;
  if (!rel) return withPoss;
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
  const clause = predicateText(agreeForms, rel.verbPhrase, rel.directObject, rel.complements);
  const gap = relativeGapComplement(np, QUE);
  const relativizer = prepHead ? prepObjectText(prepHead.head, prepHead.prep)
    : isPlainLocativeGap(rel) ? 'donde' : gap ? complementsPhrase(gap, {}, '') : 'que';
  return `${withPoss} ${relativizer} ${[subjText, clause].filter(Boolean).join(' ')}`.trimEnd();
}
