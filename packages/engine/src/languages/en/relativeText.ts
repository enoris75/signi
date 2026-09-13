import type { ResolvedNounPhrase } from '../../types.js';
import { predicateParts } from './predicateParts.js';
import { subjectText } from './subjectText.js';

/**
 * A restrictive relative clause on `np`: relativizer + the clause's predicate. "who"
 * for a personal head, "that" otherwise (English uses the same relativizer whether the
 * head is the clause's subject or object). For a subject-relative the head fills the
 * subject slot and drives agreement ("the boy who cried"). For a non-subject relative
 * the gap slot is already absent from the clause and it carries its own subject, which
 * is rendered after the relativizer and drives agreement ("the book that I read").
 */
export function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  // English relativises on PERSONHOOD, not animacy: "who" for a person, "that" for anything else
  // (an animal is animate but still takes "that"/"which").
  const pronoun = np.head.forms['human'] === '1' ? 'who' : 'that';
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.agreement;
  const subjText = subjectRelative ? '' : subjectText(rel.subject!);
  return [pronoun, subjText, ...predicateParts(agreeForms, rel.verbPhrase, rel.directObject, rel.complements)]
    .filter(Boolean)
    .join(' ');
}
