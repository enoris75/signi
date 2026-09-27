import type { ResolvedNounPhrase } from '../../types.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { relativeAlarmHead } from '../../functions/relativeAlarmHead.js';
import { relativeAgentGap } from '../../functions/relativeAgentGap.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativePossessed } from '../../functions/relativePossessed.js';
import { relativeSubjectIsNegative } from '../../functions/relativeSubjectIsNegative.js';
import { relativePrepositionalHead } from '../../functions/relativePrepositionalHead.js';
import { relativeInvertsCopula } from '../../functions/relativeInvertsCopula.js';
import { agentPhrase } from './agentPhrase.js';
import { alarmCryText } from './alarmCryText.js';
import { complementsPhrase } from './complementsPhrase.js';
import { predicateText } from './predicateText.js';
import { prepArt } from './prepArt.js';
import { defArticle } from './defArticle.js';
import { isPlural } from './isPlural.js';
import { joinArt } from './joinArt.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { prepObjectText } from './prepObjectText.js';
import { subjectText } from './subjectText.js';
import { withChe } from './withChe.js';

/**
 * The relative pronoun after a preposition, agreeing with the head (P04 §2.3, verify): *il qual, la
 * quala, ils quals, las qualas*, under the preposition's contraction ("cun il qual", "da la quala",
 * "al qual", "dils quals").
 */
function qualForms(head: Record<string, string>): Record<string, string> {
  const fem = head['gender'] === 'fem';
  return { base: fem ? 'quala' : 'qual', plural: fem ? 'qualas' : 'quals', definiteness: 'definite' };
}

/**
 * A relative clause on `np` (P04-E15 D2): invariant *che* for both subject and object relatives, eliding
 * before a vowel — "il gat che maglia", "la miur ch'il gat maglia" — the relative clause's own
 * subject always spoken, a pronoun included ("il cudisch che jeu legel"). When the head fills a
 * complement, the relativizer is that complement's preposition with *il qual* agreeing with the head
 * ("la casa sut la quala il gat maglia", "l'um al qual la dunna dat il cudisch"); a plain locative
 * gap is *nua* ("in liug nua ins viva", verify). A possessor
 * gap puts the possessed first, then *da* + *il qual* ("in period il num dil qual ei in pled", verify). A
 * passive's agent gap is *da* + *il qual* ("l'uffant dil qual il cudisch vegn scrit").
 */
export function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  const QUAL = qualForms(np.head.forms);
  const possessed = relativePossessed(rel);
  if (possessed) {
    const plural = (np.head.forms['number'] ?? np.head.forms['count']) === 'plural';
    // The possessed noun takes the definite article of its own, agreeing with it: "in pled la
    // significaziun dil qual …" (the possessed is handed over bare, as the `it` engine's *il cui*).
    const pf = firstConjunct(possessed).head.forms;
    const text = subjectText(possessed);
    const noun = joinArt(defArticle(pf, isPlural(pf), text), text);
    return [
      noun, `${prepArt('da', { gender: np.head.forms['gender'] ?? 'masc' }, plural, QUAL['base'])} ${plural ? QUAL['plural'] : QUAL['base']}`,
      predicateText(possessed.agreement, rel.verbPhrase, rel.directObject, rel.complements, undefined, relativeSubjectIsNegative(rel)),
    ].filter(Boolean).join(' ');
  }
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const alarmHead = relativeAlarmHead(np, QUAL);
  const prepHead = relativePrepositionalHead(np, QUAL);
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.agreement;
  const predicateFor = (forms: Record<string, string>) =>
    predicateText(forms, rel.verbPhrase, rel.directObject, rel.complements, rel.agent, relativeSubjectIsNegative(rel));
  const pred = predicateFor(agreeForms);
  const gap = relativeGapComplement(np, QUAL);
  const agentGap = relativeAgentGap(np, QUAL);
  const relativizer = agentGap ? agentPhrase(agentGap)
    : alarmHead ? alarmCryText(alarmHead)
    : prepHead ? prepObjectText(prepHead.head, prepHead.prep)
    : isPlainLocativeGap(rel) ? 'nua'
      : gap ? complementsPhrase(gap, {}, '', {}, rel.verbPhrase.verb.forms) : 'che';
  const subjText = subjectRelative ? '' : subjectText(rel.subject!);
  // A relative on the one who likes says its subject after the verb, as the meins clause does (A369).
  if (rel.headRole === 'terminus' && rel.verbPhrase.verb.forms['experiencer'] === '1' && subjText) {
    const inverted = predicateText(agreeForms, rel.verbPhrase, rel.directObject, rel.complements, rel.agent, false,
      { text: subjText, negative: relativeSubjectIsNegative(rel) });
    return withChe(relativizer, inverted);
  }
  // The bare copula goes before its noun subject (A221): "in liug nua ei il gat", "sut la quala ei il gat".
  if (relativeInvertsCopula(rel)) return withChe(relativizer, `${pred} ${subjText}`.trim());
  return withChe(relativizer, [subjText, pred].filter(Boolean).join(' '));
}
