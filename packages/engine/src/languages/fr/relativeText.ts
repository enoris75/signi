import type { ResolvedNounPhrase } from '../../types.js';
import { isGenericSubject } from '../../functions/isGenericSubject.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { relativeAlarmHead } from '../../functions/relativeAlarmHead.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { alarmCryText } from './alarmCryText.js';
import { complementsPhrase } from './complementsPhrase.js';
import { VOWEL_START } from './fr.consts.js';
import { joinArt } from './joinArt.js';
import { joinSubject } from './joinSubject.js';
import { predicateText } from './predicateText.js';
import { subjectText } from './subjectText.js';

/**
 * A relative clause on `np`. A subject-relative uses "qui" and the head drives agreement
 * ("le garçon qui pleure"). A non-subject (direct-object) relative uses "que" — elided to
 * "qu'" before a vowel — followed by the clause's own subject, which drives agreement
 * ("le livre que je lis"). When the head fills a complement, the relativizer is that complement's
 * preposition with "lequel", agreeing with the head and fused with its article ("la maison sous
 * laquelle le chat mange", "le garçon auquel l'homme donne le livre", "à cause duquel"). So does the alarm a
 * cry raises, which the cry takes as its à-complement: "le loup auquel le garçon cria" (A129). A plain
 * locative gap is the relative adverb "où" instead ("la maison où le chat mange", C07).
 */
export function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  if (rel.headRole === 'subject' || !rel.subject) {
    return `qui ${predicateText(np.head.forms, rel.verbPhrase, rel.directObject, rel.complements)}`.trim();
  }
  const subjText = subjectText(rel.subject);
  const fem = np.head.forms['gender'] === 'fem';
  const QUEL = { base: fem ? 'quelle' : 'quel', plural: fem ? 'quelles' : 'quels', definiteness: 'definite' };
  const alarmHead = relativeAlarmHead(np, QUEL);
  const gap = relativeGapComplement(np, QUEL);
  // "lequel" is written as one word with its article, contracted or not: lequel, laquelle, duquel, auxquels.
  // When the head is the clause's DIRECT OBJECT, it is a preceding object and an avoir participle
  // agrees with it ("la souris que le chat a mangée"); a complement-role head triggers no agreement, and
  // nor does an alarm, which is the cry's à-complement ("le loup auquel le garçon a crié").
  const precedingObject = rel.headRole === 'directObject' && !alarmHead ? np.head.forms : undefined;
  const pred = predicateText(rel.subject.agreement, rel.verbPhrase, rel.directObject, rel.complements, precedingObject);
  // The subject joins its predicate as in a main clause, "je" eliding ("que j'aime").
  const clause = joinSubject(subjText, pred);
  // The generic "on" after "où" takes the euphonic l' of the written language: "un lieu où l'on vit".
  if (isPlainLocativeGap(rel)) return `où ${isGenericSubject(rel.subject) ? `l'${clause}` : clause}`.trim();
  const lequel = alarmHead ? alarmCryText(alarmHead) : gap ? complementsPhrase(gap, {}, '') : '';
  return (lequel
    ? `${lequel.replace(/\b(le|la|les|du|des|au|aux) (quel)/, '$1$2')} ${clause}`
    : joinArt(VOWEL_START.test(clause) ? "qu'" : 'que', clause)).trim();
}
