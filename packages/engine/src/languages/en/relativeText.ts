import type { ResolvedNounPhrase } from '../../types.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { relativeAgentGap } from '../../functions/relativeAgentGap.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativePossessed } from '../../functions/relativePossessed.js';
import { relativeSubjectIsNegative } from '../../functions/relativeSubjectIsNegative.js';
import { agentPhrase } from './agentPhrase.js';
import { complementsPhrase } from './complementsPhrase.js';
import { predicateParts } from './predicateParts.js';
import { subjectText } from './subjectText.js';

/**
 * A restrictive relative clause on `np`: relativizer + the clause's predicate. "who"
 * for a personal head, "that" otherwise (English uses the same relativizer whether the
 * head is the clause's subject or object). For a subject-relative the head fills the
 * subject slot and drives agreement ("the boy who cried"). For a non-subject relative
 * the gap slot is already absent from the clause and it carries its own subject, which
 * is rendered after the relativizer and drives agreement ("the book that I read"). When the head
 * fills a complement, the relativizer takes that complement's preposition, "whom" for a person and
 * "which" otherwise ("the house under which the cat eats", "the boy to whom the man gives the book").
 * A plain locative gap is the relative adverb "where" instead ("a place where one lives", C07).
 * A possessor gap is the genitive relative "whose", which takes the place of the possessed
 * phrase's determiner ("a period whose noun is a word"). A passive's agent gap takes the by-phrase's
 * "by" ("the child by whom the book is written"), and a passive's other gaps carry their agent after
 * the participle ("the book that is written by the child").
 */
export function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  // Genitive relative: "whose" + the possessed phrase, article-less, then the clause's predicate,
  // which agrees with that phrase and not with the head ("a period whose nouns are words").
  const possessed = relativePossessed(rel);
  if (possessed) {
    return ['whose', subjectText(possessed),
      ...predicateParts(possessed.agreement, rel.verbPhrase, rel.directObject, rel.complements)]
      .filter(Boolean).join(' ');
  }
  // English relativises on PERSONHOOD, not animacy: "who" for a person, "that" for anything else
  // (an animal is animate but still takes "that"/"which").
  const human = np.head.forms['human'] === '1';
  const WHOM = { base: human ? 'whom' : 'which', definiteness: 'bare' };
  const gap = relativeGapComplement(np, WHOM);
  const agentGap = relativeAgentGap(np, WHOM);
  // The object of a verb that takes it with a preposition relativises on that preposition, as a
  // complement does — "a clause on which another clause depends" — where the others pied-pipe it
  // too (it "dalla quale", de "von dem"). Formal English, and never a stranded preposition that a
  // following complement would read as its own.
  const objectPrep = rel.headRole === 'directObject' ? objectPreposition(rel.verbPhrase.verb) : '';
  const pronoun = agentGap ? agentPhrase(agentGap)
    : isPlainLocativeGap(rel) ? 'where' : gap ? complementsPhrase(gap)
    : objectPrep ? `${objectPrep} ${WHOM.base}` : human ? 'who' : 'that';
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.agreement;
  const subjText = subjectRelative ? '' : subjectText(rel.subject!);
  // A `no` head negates the MATRIX clause, so a subject relative's head never disarms the relative's
  // own negation ("no cat that does not eat"). Any other relative carries its own subject, and that
  // subject's `no` is this clause's negator, as in the main clause (A160, A166): "the mouse that no
  // cat eats", "the mouse that no cat eats in any house". See `relativeSubjectIsNegative`.
  return [pronoun, subjText,
    ...predicateParts(agreeForms, rel.verbPhrase, rel.directObject, rel.complements, relativeSubjectIsNegative(rel), rel.agent)]
    .filter(Boolean)
    .join(' ');
}
