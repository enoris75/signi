import { isGenericSubject, relativeGapComplement, type ResolvedNounPhrase } from '../../types.js';
import { complementsPhrase } from './complementsPhrase.js';
import { predicateText } from './predicateText.js';
import { subjectText } from './subjectText.js';

/**
 * A relative clause on `np`: invariant "che" for both subject- and object-relatives. A
 * subject-relative agrees with the head ("il ragazzo che piange"); an object-relative
 * carries the clause's own subject, which drives agreement ("il libro che io leggo"). When the head
 * fills a complement, the relativizer is that complement's preposition fused with "il quale",
 * agreeing with the head ("la casa nella quale il gatto mangia", "il ragazzo al quale l'uomo dà il
 * libro").
 */
export function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.agreement;
  // An impersonal ("si") subject is not written as a subject word: predicateText emits the "si"
  // proclitic instead, off the generic flag on agreeForms — "una cosa che si mangia".
  const subjText = subjectRelative || isGenericSubject(rel.subject!) ? '' : subjectText(rel.subject!);
  const pred = predicateText(agreeForms, rel.verbPhrase, rel.directObject, rel.complements);
  const gap = relativeGapComplement(np, { base: 'quale', plural: 'quali', definiteness: 'definite' });
  const relativizer = gap ? complementsPhrase(gap, {}, '') : 'che';
  return `${relativizer} ${[subjText, pred].filter(Boolean).join(' ')}`.trim();
}
