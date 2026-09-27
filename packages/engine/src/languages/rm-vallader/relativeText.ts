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
import { withCha } from './withCha.js';
import { THAT } from './vallader.consts.js';

/**
 * The relative pronoun after a preposition, agreeing with the head (the author's draft, verify): *il
 * qual, la quala, ils quals, las qualas*, under the preposition's contraction ("cun il qual", "da la
 * quala", "al qual", "dals quals", "i'l qual").
 */
function qualForms(head: Record<string, string>): Record<string, string> {
  const fem = head['gender'] === 'fem';
  return { base: fem ? 'quala' : 'qual', plural: fem ? 'qualas' : 'quals', definiteness: 'definite' };
}

/**
 * A relative clause on `np` (P04-E15 D2): *chi* for a subject relative and *cha* for an object one,
 * as Vallader tells them apart (the author's draft, verify) — "il giat chi mangia", "la mür cha'l giat
 * mangia", *cha* eliding and fusing as the complementizer does (`withCha`) — the relative clause's own
 * subject always spoken, a pronoun included ("il cudesch ch'eu leg"). When the head fills a
 * complement, the relativizer is that complement's preposition with *il qual* agreeing with the head
 * ("la chasa suot la quala il giat mangia", "l'hom al qual la duonna da il cudesch"); a plain locative
 * gap is *ingio* ("ün lö ingio ins viva", verify). A possessor gap puts the possessed first, then *da*
 * + *il qual* ("ün pled la significaziun dal qual es …", verify). A passive's agent gap is *da* + *il
 * qual* ("l'uffant dal qual il cudesch vain scrit").
 */
export function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  const QUAL = qualForms(np.head.forms);
  const possessed = relativePossessed(rel);
  if (possessed) {
    const plural = (np.head.forms['number'] ?? np.head.forms['count']) === 'plural';
    // The possessed noun takes the definite article of its own, agreeing with it: "ün pled la
    // significaziun dal qual …" (the possessed is handed over bare, as the `it` engine's *il cui*).
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
    : isPlainLocativeGap(rel) ? 'ingio'
      : gap ? complementsPhrase(gap, {}, '', {}, rel.verbPhrase.verb.forms)
      : subjectRelative ? 'chi' : THAT;
  const subjText = subjectRelative ? '' : subjectText(rel.subject!);
  // A relative on the one who likes says its subject after the verb, as the main clause does (A369).
  if (rel.headRole === 'terminus' && rel.verbPhrase.verb.forms['experiencer'] === '1' && subjText) {
    const inverted = predicateText(agreeForms, rel.verbPhrase, rel.directObject, rel.complements, rel.agent, false,
      { text: subjText, negative: relativeSubjectIsNegative(rel) });
    return withCha(relativizer, inverted);
  }
  // The bare copula goes before its noun subject (A221): "ün lö ingio es il giat", "suot la quala es il giat".
  if (relativeInvertsCopula(rel)) return withCha(relativizer, `${pred} ${subjText}`.trim());
  return withCha(relativizer, [subjText, pred].filter(Boolean).join(' '));
}
