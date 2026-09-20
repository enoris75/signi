import type { ResolvedNounPhrase } from '../../types.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativePossessed } from '../../functions/relativePossessed.js';
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
 * phrase's determiner ("a period whose noun is a word").
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
  const gap = relativeGapComplement(np, { base: human ? 'whom' : 'which', definiteness: 'bare' });
  const pronoun = isPlainLocativeGap(rel) ? 'where' : gap ? complementsPhrase(gap) : human ? 'who' : 'that';
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.agreement;
  const subjText = subjectRelative ? '' : subjectText(rel.subject!);
  return [pronoun, subjText, ...predicateParts(agreeForms, rel.verbPhrase, rel.directObject, rel.complements)]
    .filter(Boolean)
    .join(' ');
}
