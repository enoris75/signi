import type { ResolvedNounPhrase } from '../../types.js';
import { isGenericSubject } from '../../resolved/isGenericSubject.js';
import { relativeGapComplement } from '../../resolved/relativeGapComplement.js';
import { complementsPhrase } from './complementsPhrase.js';
import { modifierText } from './modifierText.js';
import { possessorText } from './possessorText.js';
import { predicateText } from './predicateText.js';
import { subjectText } from './subjectText.js';

/**
 * Append a noun phrase's attributive nouns, possessor, and relative clause (invariant
 * "que" + predicate). A subject-relative agrees with the head ("el niño que llora"); an
 * object-relative carries the clause's own subject, which drives agreement ("el libro que yo leo").
 * When the head fills a complement, the relativizer is that complement's preposition with the
 * article and "que", agreeing with the head ("la casa en la que el gato come", "el niño al que el hombre da el libro").
 */
export function withRelative(text: string, np: ResolvedNounPhrase): string {
  const withPoss = `${text}${modifierText(np)}${possessorText(np)}`;
  const rel = np.relative;
  if (!rel) return withPoss;
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  // A plural head gapped as the object of the impersonal se is the passive se's patient, and the verb
  // agrees with it: "los ratones que se comen".
  const passiveSe = !subjectRelative && rel.headRole === 'directObject' && isGenericSubject(rel.subject!)
    && (np.head.forms['number'] ?? np.head.forms['count']) === 'plural';
  const agreeForms = subjectRelative ? np.head.forms
    : passiveSe ? { ...rel.subject!.agreement, number: 'plural' } : rel.subject!.agreement;
  // An impersonal ("se") subject is emitted as a proclitic by predicateText (off the generic flag
  // on agreeForms), not as a subject word — "una cosa que se come".
  const subjText = subjectRelative || isGenericSubject(rel.subject!) ? '' : subjectText(rel.subject!);
  const clause = predicateText(agreeForms, rel.verbPhrase, rel.directObject, rel.complements);
  const gap = relativeGapComplement(np, { base: 'que', plural: 'que', definiteness: 'definite' });
  const relativizer = gap ? complementsPhrase(gap, {}, '') : 'que';
  return `${withPoss} ${relativizer} ${[subjText, clause].filter(Boolean).join(' ')}`.trimEnd();
}
