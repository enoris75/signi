import type { ResolvedNounPhrase } from '../../types.js';
import { isGenericSubject } from '../../functions/isGenericSubject.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { negatedAntecedentVerbPhrase } from '../../functions/negatedAntecedentVerbPhrase.js';
import { relativeAgentGap } from '../../functions/relativeAgentGap.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativeGapType } from '../../functions/relativeGapType.js';
import { relativePossessed } from '../../functions/relativePossessed.js';
import { relativeSubjectIsNegative } from '../../functions/relativeSubjectIsNegative.js';
import { relativePrepositionalHead } from '../../functions/relativePrepositionalHead.js';
import { relativeDropsSubject } from '../../functions/relativeDropsSubject.js';
import { agentPhrase } from './agentPhrase.js';
import { complementsPhrase } from './complementsPhrase.js';
import { modifierText } from './modifierText.js';
import { possessorText } from './possessorText.js';
import { caAdj } from './caAdj.js';
import { caSurface } from './caSurface.js';
import { defArticle } from './defArticle.js';
import { possessorBeforeStandard } from '../../functions/possessorBeforeStandard.js';
import { predicateText } from './predicateText.js';
import { prepObjectText } from './prepObjectText.js';
import { subjectText } from './subjectText.js';
import { caExamples } from './caExamples.js';

/**
 * The stand-in a prepositional relativizer is built on (P03 §2.3): *qui* for a person ("el nen a qui
 * l'home dona el llibre"), else *el qual*, its article agreeing with the head ("la casa sota la qual",
 * "el gat al qual", "les cases de les quals").
 */
function relativizerForms(head: Record<string, string>): Record<string, string> {
  return head['human'] === '1'
    ? { base: 'qui', plural: 'qui', definiteness: 'bare' }
    : { base: 'qual', plural: 'quals', definiteness: 'definite' };
}

/**
 * Append a noun phrase's attributive nouns, possessor, and relative clause (invariable *que* +
 * predicate). A subject relative agrees with the head ("el nen que plora"); an object relative carries
 * the clause's own subject ("el llibre que el gat llegeix"). A pronoun subject is dropped, as in the
 * main clause ("el llibre que llegeixo"), unless the clause would then read as a subject relative
 * (`relativeDropsSubject`, A173). A head that fills a complement relativises on that complement's
 * preposition + *el qual* / *qui* (`relativizerForms`); a plain locative gap is *on* ("un lloc on es
 * viu"); a possessor gap is *del qual* after the possessed phrase ("un període el substantiu del qual
 * és una paraula"); a passive's agent gap is "pel qual" / "per qui".
 */
export function withRelative(text: string, np: ResolvedNounPhrase): string {
  return caSurface(relativeText(text, np));
}

function relativeText(text: string, np: ResolvedNounPhrase): string {
  // Adjectives held back past a genitive possessor, one of them with its standard (A372).
  const trail = possessorBeforeStandard(np) ? caAdj(np).trail : '';
  const withPoss = `${text}${modifierText(np)}${possessorText(np)}${trail ? ` ${trail}` : ''}`;
  // The members of the head's set it names follow everything, the relative clause included (P09-E33).
  const examples = caExamples(np);
  const rel = np.relative;
  if (!rel) return `${withPoss}${examples}`;
  // Under a `no` head the relative asserts nothing about a real referent, so its verb takes the
  // subjunctive, on every branch below: "cap gat que mengi" (A170).
  const verbPhrase = negatedAntecedentVerbPhrase(np, rel.verbPhrase);
  // Genitive relative: the possessed phrase, with its article, then "del qual" agreeing with the head:
  // "un període el substantiu del qual és una paraula". The clause's verb agrees with the possessed.
  const possessed = relativePossessed(rel, 'definite');
  if (possessed) {
    const hf = np.head.forms;
    const hplural = (hf['number'] ?? hf['count']) === 'plural';
    const whose = hf['human'] === '1' ? 'de qui' : `de ${defArticle(hf, hplural)} ${hplural ? 'quals' : 'qual'}`;
    const owned = [subjectText(possessed), whose,
      predicateText(possessed.agreement, verbPhrase, rel.directObject, rel.complements, undefined, relativeSubjectIsNegative(rel))];
    return `${withPoss} ${owned.filter(Boolean).join(' ')}`.trimEnd() + examples;
  }
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const QUE = relativizerForms(np.head.forms);
  // The object of a verb that takes it with a preposition relativises on that preposition, as a
  // complement does: "el botó al qual el gat clica" (A139).
  const prepHead = relativePrepositionalHead(np, QUE);
  // A plural head gapped as the object of the impersonal es is the passive es's patient, and the verb
  // agrees with it: "els ratolins que es mengen".
  const passiveSe = !subjectRelative && rel.headRole === 'directObject' && !prepHead && isGenericSubject(rel.subject!)
    && (np.head.forms['number'] ?? np.head.forms['count']) === 'plural';
  const agreeForms = subjectRelative ? np.head.forms
    : passiveSe ? { ...rel.subject!.agreement, number: 'plural' } : rel.subject!.agreement;
  // Whether the relative's OWN subject negates it, asked of the clause and not of `agreeForms` (A167).
  const predicateFor = (forms: Record<string, string>) =>
    predicateText(forms, verbPhrase, rel.directObject, rel.complements, rel.agent, relativeSubjectIsNegative(rel),
      relativeGapType(rel));
  const clause = predicateFor(agreeForms);
  const gap = relativeGapComplement(np, QUE);
  const agentGap = relativeAgentGap(np, QUE);
  const relativizer = agentGap ? agentPhrase(agentGap)
    : prepHead ? prepObjectText(prepHead.head, prepHead.prep)
    : isPlainLocativeGap(rel) ? 'on' : gap ? complementsPhrase(gap, {}, '') : 'que';
  // An impersonal ("es") subject is a proclitic predicateText places, not a subject word — "una cosa
  // que es menja". A pronoun subject is dropped as in the main clause where that leaves no
  // subject-relative reading (A173).
  const subjText = subjectRelative || isGenericSubject(rel.subject!) || relativeDropsSubject(np, relativizer === 'que', predicateFor)
    ? '' : subjectText(rel.subject!);
  // A relative on the one who likes says its subject after the verb, as the main clause does (A369):
  // "el gat a qui li agrada el gos".
  if (rel.headRole === 'terminus' && verbPhrase.verb.forms['experiencer'] === '1' && subjText) {
    const inverted = predicateText(agreeForms, verbPhrase, rel.directObject, rel.complements, rel.agent, false, relativeGapType(rel),
      { text: subjText, negative: relativeSubjectIsNegative(rel) });
    return `${withPoss} ${relativizer} ${inverted}`.trimEnd() + examples;
  }
  return `${withPoss} ${relativizer} ${[subjText, clause].filter(Boolean).join(' ')}`.trimEnd() + examples;
}
