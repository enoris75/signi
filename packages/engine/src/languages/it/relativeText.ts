import type { ResolvedNounPhrase } from '../../types.js';
import { isGenericSubject } from '../../functions/isGenericSubject.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { relativeAlarmHead } from '../../functions/relativeAlarmHead.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { relativeAgentGap } from '../../functions/relativeAgentGap.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativePossessed } from '../../functions/relativePossessed.js';
import { relativeSubjectIsNegative } from '../../functions/relativeSubjectIsNegative.js';
import { relativePrepositionalHead } from '../../functions/relativePrepositionalHead.js';
import { relativeDropsSubject } from '../../functions/relativeDropsSubject.js';
import { relativeInvertsCopula } from '../../functions/relativeInvertsCopula.js';
import { agentPhrase } from './agentPhrase.js';
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
 * carries the clause's own subject, which drives agreement ("il libro che il gatto legge"). A pronoun
 * subject is dropped, as in the main clause ("il libro che leggo"), unless the clause would then read
 * as a subject relative ("il gatto che lui vede", see `relativeDropsSubject`, A173). When the head
 * fills a complement, the relativizer is that complement's preposition fused with "il quale",
 * agreeing with the head ("la casa sotto la quale il gatto mangia", "il ragazzo al quale l'uomo dà il
 * libro"). So does the alarm a cry raises, which the cry takes as its a-complement: "il lupo al quale il
 * ragazzo gridò" (A129). A plain locative gap is the relative adverb "dove" instead ("un luogo dove si
 * vive", C07). A possessor gap is the genitive relative "il cui", whose article agrees with the
 * possessed noun ("un periodo il cui nome è una parola"). A passive's agent gap fuses "da" with "il
 * quale" ("il bambino dal quale il libro è scritto"); its other gaps carry the agent after the
 * participle ("il libro che è scritto dal bambino").
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
      predicateText(possessed.agreement, rel.verbPhrase, rel.directObject, rel.complements, undefined, relativeSubjectIsNegative(rel)),
    ]);
  }
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const QUALE = { base: 'quale', plural: 'quali', definiteness: 'definite' };
  const alarmHead = relativeAlarmHead(np, QUALE);
  // So is the object of a verb that takes it with a preposition: "il pulsante sul quale si clicca" (A139).
  const prepHead = relativePrepositionalHead(np, QUALE);
  // A head gapped as the object of the impersonal si is the passive si's patient: a plural one moves the
  // verb ("i topi che si mangiano", "i libri che si sono salvati"), and in a compound tense the participle
  // agrees with it in either number ("l'opzione che si è salvata"), as with a spoken patient in
  // `predicateText`. An alarm is no object, so si stays impersonal: "i lupi ai quali si grida".
  const siPatient = !subjectRelative && rel.headRole === 'directObject' && !alarmHead && !prepHead && isGenericSubject(rel.subject!);
  const headNumber = np.head.forms['number'] ?? np.head.forms['count'] ?? 'singular';
  const passiveSi = siPatient && headNumber === 'plural';
  const agreeForms = subjectRelative ? np.head.forms
    : passiveSi ? { ...rel.subject!.agreement, number: 'plural' } : rel.subject!.agreement;
  const gappedPatient = siPatient ? { gender: np.head.forms['gender'] ?? 'masc', number: headNumber } : undefined;
  // Whether the relative's OWN subject negates it, asked of the clause and not of `agreeForms`: a
  // subject relative agrees with its head, but a `no` head negates the matrix clause, so the relative
  // keeps its "non" ("nessun gatto che non mangia corre", A167).
  const predicateFor = (forms: Record<string, string>) =>
    predicateText(forms, rel.verbPhrase, rel.directObject, rel.complements, rel.agent, relativeSubjectIsNegative(rel), gappedPatient);
  const pred = predicateFor(agreeForms);
  const gap = relativeGapComplement(np, QUALE);
  const agentGap = relativeAgentGap(np, QUALE);
  const relativizer = agentGap ? agentPhrase(agentGap)
    : alarmHead ? alarmCryText(alarmHead)
    : prepHead ? prepObjectText(prepHead.head, prepHead.prep)
    : isPlainLocativeGap(rel) ? 'dove'
      // The verb's forms, for a goal preposition its lexeme fixes: "la casa verso la quale il gatto si muove".
      : gap ? complementsPhrase(gap, {}, '', {}, rel.verbPhrase.verb.forms) : 'che';
  // An impersonal ("si") subject is not written as a subject word: predicateText emits the "si"
  // proclitic instead, off the generic flag on agreeForms — "una cosa che si mangia". A pronoun subject
  // is dropped as in the main clause, "il libro che leggo", where that leaves no subject-relative
  // reading (A173).
  const subjText = subjectRelative || isGenericSubject(rel.subject!) || relativeDropsSubject(np, relativizer === 'che', predicateFor)
    ? '' : subjectText(rel.subject!);
  // The bare copula goes before its noun subject, "dove" eliding before "è" and "era": "un luogo dov'è il
  // gatto", "dove sono i gatti", "sotto la quale è il gatto" (A221, see `relativeInvertsCopula`).
  if (relativeInvertsCopula(rel)) {
    const lead = relativizer === 'dove' && /^(?:è|era)$/.test(pred) ? `dov'${pred}` : `${relativizer} ${pred}`;
    return `${lead} ${subjText}`.trim();
  }
  return `${relativizer} ${[subjText, pred].filter(Boolean).join(' ')}`.trim();
}
