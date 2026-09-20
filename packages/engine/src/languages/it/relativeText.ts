import type { ResolvedNounPhrase } from '../../types.js';
import { isGenericSubject } from '../../functions/isGenericSubject.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { relativeAlarmHead } from '../../functions/relativeAlarmHead.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativePossessed } from '../../functions/relativePossessed.js';
import { relativePrepositionalHead } from '../../functions/relativePrepositionalHead.js';
import { alarmCryText } from './alarmCryText.js';
import { complementsPhrase } from './complementsPhrase.js';
import { defArticle } from './defArticle.js';
import { isPlural } from './isPlural.js';
import { joinWords } from './joinWords.js';
import { predicateText } from './predicateText.js';
import { prepObjectText } from './prepObjectText.js';
import { subjectText } from './subjectText.js';

/**
 * A relative clause on `np`: invariant "che" for both subject- and object-relatives. A
 * subject-relative agrees with the head ("il ragazzo che piange"); an object-relative
 * carries the clause's own subject, which drives agreement ("il libro che io leggo"). When the head
 * fills a complement, the relativizer is that complement's preposition fused with "il quale",
 * agreeing with the head ("la casa sotto la quale il gatto mangia", "il ragazzo al quale l'uomo dà il
 * libro"). So does the alarm a cry raises, which the cry takes as its a-complement: "il lupo al quale il
 * ragazzo gridò" (A129). A plain locative gap is the relative adverb "dove" instead ("un luogo dove si
 * vive", C07). A possessor gap is the genitive relative "il cui", whose article agrees with the
 * possessed noun ("un periodo il cui nome è una parola").
 */
export function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  // Genitive relative: the definite article, "cui", then the possessed phrase without an article
  // of its own — "un periodo il cui nome è una parola". The article agrees with the possessed
  // noun, not with the head, and so does the clause's verb.
  const possessed = relativePossessed(rel);
  if (possessed) {
    const pf = firstConjunct(possessed).head.forms;
    const noun = subjectText(possessed);
    return joinWords([
      defArticle(pf, isPlural(pf), noun), 'cui', noun,
      predicateText(possessed.agreement, rel.verbPhrase, rel.directObject, rel.complements),
    ]);
  }
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const QUALE = { base: 'quale', plural: 'quali', definiteness: 'definite' };
  const alarmHead = relativeAlarmHead(np, QUALE);
  // So is the object of a verb that takes it with a preposition: "il pulsante sul quale si clicca" (A139).
  const prepHead = relativePrepositionalHead(np, QUALE);
  // A plural head gapped as the object of the impersonal si is the passive si's patient, and the verb
  // agrees with it: "i topi che si mangiano" (the compound tense aside, as in `predicateText`). An alarm is
  // no object, so si stays impersonal: "i lupi ai quali si grida".
  const passiveSi = !subjectRelative && rel.headRole === 'directObject' && !alarmHead && !prepHead && isGenericSubject(rel.subject!)
    && (np.head.forms['number'] ?? np.head.forms['count']) === 'plural' && rel.verbPhrase.aspect !== 'resultative';
  const agreeForms = subjectRelative ? np.head.forms
    : passiveSi ? { ...rel.subject!.agreement, number: 'plural' } : rel.subject!.agreement;
  // An impersonal ("si") subject is not written as a subject word: predicateText emits the "si"
  // proclitic instead, off the generic flag on agreeForms — "una cosa che si mangia".
  const subjText = subjectRelative || isGenericSubject(rel.subject!) ? '' : subjectText(rel.subject!);
  const pred = predicateText(agreeForms, rel.verbPhrase, rel.directObject, rel.complements);
  const gap = relativeGapComplement(np, QUALE);
  const relativizer = alarmHead ? alarmCryText(alarmHead)
    : prepHead ? prepObjectText(prepHead.head, prepHead.prep)
    : isPlainLocativeGap(rel) ? 'dove'
      : gap ? complementsPhrase(gap, {}, '') : 'che';
  return `${relativizer} ${[subjText, pred].filter(Boolean).join(' ')}`.trim();
}
