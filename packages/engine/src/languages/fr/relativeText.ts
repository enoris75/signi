import type { ResolvedNounPhrase } from '../../types.js';
import { isGenericSubject } from '../../functions/isGenericSubject.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { relativeAgentGap } from '../../functions/relativeAgentGap.js';
import { relativeAlarmHead } from '../../functions/relativeAlarmHead.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativePossessed } from '../../functions/relativePossessed.js';
import { relativeSubjectIsNegative } from '../../functions/relativeSubjectIsNegative.js';
import { relativePrepositionalHead } from '../../functions/relativePrepositionalHead.js';
import { agentPhrase } from './agentPhrase.js';
import { alarmCryText } from './alarmCryText.js';
import { complementsPhrase } from './complementsPhrase.js';
import { VOWEL_START } from './fr.consts.js';
import { joinArt } from './joinArt.js';
import { joinSubject } from './joinSubject.js';
import { predicateText } from './predicateText.js';
import { prepObjectText } from './prepObjectText.js';
import { subjectText } from './subjectText.js';

/**
 * A relative clause on `np`. A subject-relative uses "qui" and the head drives agreement
 * ("le garçon qui pleure"). A non-subject (direct-object) relative uses "que" — elided to
 * "qu'" before a vowel — followed by the clause's own subject, which drives agreement
 * ("le livre que je lis"). When the head fills a complement, the relativizer is that complement's
 * preposition with "lequel", agreeing with the head and fused with its article ("la maison sous
 * laquelle le chat mange", "le garçon auquel l'homme donne le livre", "à cause duquel"). So does the alarm a
 * cry raises, which the cry takes as its à-complement: "le loup auquel le garçon cria" (A129). A plain
 * locative gap is the relative adverb "où" instead ("la maison où le chat mange", C07). A possessor gap is "dont",
 * which keeps the possessed phrase's own article ("une période dont le nom est un mot"). A passive's agent
 * gap is "par lequel" ("l'enfant par lequel le livre est écrit"); its other gaps carry the agent after
 * the participle ("le livre qui est écrit par l'enfant").
 */
export function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  // Genitive relative: "dont", the one relativizer French writes *before* the possessed phrase
  // while leaving it its own article — "une période dont le nom est un mot". The clause agrees
  // with that phrase, not with the head.
  const possessed = relativePossessed(rel, 'definite');
  if (possessed) {
    return `dont ${joinSubject(subjectText(possessed),
      predicateText(possessed.agreement, rel.verbPhrase, rel.directObject, rel.complements, undefined, undefined, relativeSubjectIsNegative(rel)),
      rel.verbPhrase.verb.forms)}`.trim();
  }
  // A subject relative agrees with its head, but a `no` head negates the MATRIX clause and is no
  // "aucun" of this one: the relative keeps its own polarity, "aucun chat qui mange ne court", "aucun
  // chat qui ne mange pas ne court" (A167, see `relativeSubjectIsNegative`).
  if (rel.headRole === 'subject' || !rel.subject) {
    return `qui ${predicateText(np.head.forms, rel.verbPhrase, rel.directObject, rel.complements, undefined, rel.agent, relativeSubjectIsNegative(rel))}`.trim();
  }
  const subjText = subjectText(rel.subject);
  const fem = np.head.forms['gender'] === 'fem';
  const QUEL = { base: fem ? 'quelle' : 'quel', plural: fem ? 'quelles' : 'quels', definiteness: 'definite' };
  const alarmHead = relativeAlarmHead(np, QUEL);
  // So is the object of a verb that takes it with a preposition: "le bouton sur lequel le chat clique" (A139).
  const prepHead = relativePrepositionalHead(np, QUEL);
  const gap = relativeGapComplement(np, QUEL);
  const agentGap = relativeAgentGap(np, QUEL);
  // "lequel" is written as one word with its article, contracted or not: lequel, laquelle, duquel, auxquels.
  // When the head is the clause's DIRECT OBJECT, it is a preceding object and an avoir participle
  // agrees with it ("la souris que le chat a mangée"); a complement-role head triggers no agreement, and
  // nor does an alarm, which is the cry's à-complement ("le loup auquel le garçon a crié").
  const precedingObject = rel.headRole === 'directObject' && !alarmHead && !prepHead ? np.head.forms : undefined;
  const pred = predicateText(rel.subject.agreement, rel.verbPhrase, rel.directObject, rel.complements, precedingObject, rel.agent,
    relativeSubjectIsNegative(rel));
  // The subject joins its predicate as in a main clause, "je" eliding ("que j'aime").
  const clause = joinSubject(subjText, pred, rel.verbPhrase.verb.forms);
  // The generic "on" after "où" takes the euphonic l' of the written language: "un lieu où l'on vit".
  if (isPlainLocativeGap(rel)) return `où ${isGenericSubject(rel.subject) ? `l'${clause}` : clause}`.trim();
  // An object the verb takes with "de" relativises as "dont", not "duquel": "la condition dont la
  // proposition dépend", as French writes every de-complement of a verb.
  const lequel = agentGap ? agentPhrase(agentGap)
    : alarmHead ? alarmCryText(alarmHead)
    : prepHead?.prep === 'de' ? 'dont'
    : prepHead ? prepObjectText(prepHead.head, prepHead.prep)
    // The verb's forms, for a goal preposition its lexeme fixes: "la maison vers laquelle le chat se déplace".
    : gap ? complementsPhrase(gap, {}, '', {}, rel.verbPhrase.verb.forms) : '';
  return (lequel
    ? `${lequel.replace(/\b(le|la|les|du|des|au|aux) (quel)/, '$1$2')} ${clause}`
    : joinArt(VOWEL_START.test(clause) ? "qu'" : 'que', clause)).trim();
}
