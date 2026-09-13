import type { ResolvedNounPhrase } from '../../types.js';
import { VOWEL_START } from './fr.consts.js';
import { joinArt } from './joinArt.js';
import { predicateText } from './predicateText.js';
import { subjectText } from './subjectText.js';

/**
 * A relative clause on `np`. A subject-relative uses "qui" and the head drives agreement
 * ("le garçon qui pleure"). A non-subject (direct-object) relative uses "que" — elided to
 * "qu'" before a vowel — followed by the clause's own subject, which drives agreement
 * ("le livre que je lis"). Indirect/complement relativization ("dont", "à qui") is not
 * yet modelled, so those fall back to "que" — best-effort. TODO: prepositional relativizers.
 */
export function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  if (rel.headRole === 'subject' || !rel.subject) {
    return `qui ${predicateText(np.head.forms, rel.verbPhrase, rel.directObject, rel.complements)}`.trim();
  }
  const subjText = subjectText(rel.subject);
  const relzr = joinArt(VOWEL_START.test(subjText) ? "qu'" : 'que', subjText);
  // When the head is the clause's DIRECT OBJECT, it is a preceding object and an avoir participle
  // agrees with it ("la souris que le chat a mangée"); a complement-role head triggers no agreement.
  const precedingObject = rel.headRole === 'directObject' ? np.head.forms : undefined;
  const pred = predicateText(rel.subject.agreement, rel.verbPhrase, rel.directObject, rel.complements, precedingObject);
  return `${relzr} ${pred}`.trim();
}
