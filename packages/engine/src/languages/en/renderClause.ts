import type { ResolvedPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { isComplementGloss } from '../../functions/isComplementGloss.js';
import { complementGloss } from './complementGloss.js';
import { dimensionGloss } from './dimensionGloss.js';
import { invertSubject } from './invertSubject.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isRelativeGloss } from './isRelativeGloss.js';
import { mannerGloss } from './mannerGloss.js';
import { predicateParts } from './predicateParts.js';
import { relativeText } from './relativeText.js';
import { subjectText } from './subjectText.js';

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
export function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // A verbless period marked as an adjective-definition gloss is a prepositional fragment ("of
  // great size"), not a bare subject noun phrase — wrap the dimension NP in its adposition.
  if (!phrase.verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
  // A verbless period marked as a complement-definition gloss is the place or direction complement
  // that defines an adverb ("in all places", "to a higher place"), as a clause renders it.
  if (!phrase.verbPhrase && isComplementGloss(subject)) return complementGloss(subject);
  // A verbless period marked as a manner-definition gloss is the adverbial fragment that defines an
  // adverb ("at high speed"), the manner noun phrase under the adposition its `mannerRelation` picks.
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(firstConjunct(subject), subject);
  // A verbless period marked as a relative-clause gloss is the head's relative alone ("that one has
  // saved"): the head is unsaid, but it is still the antecedent the relativizer reads (who / that).
  if (!phrase.verbPhrase && isRelativeGloss(subject)) return relativeText(firstConjunct(subject));
  // An imperative drops its subject from the surface, but the subject's person/number still
  // drives the choice of imperative form (2nd person vs "let's …"), so it is kept for agreement.
  // An infinitive citation ("to consume food") is likewise subject-less on the surface.
  const dropsSubject =
    phrase.verbPhrase?.mood === 'imperative' || phrase.verbPhrase?.mood === 'infinitive';
  const subj = dropsSubject ? '' : subjectText(subject);
  // Verbless period: a bare noun phrase ("breaking news").
  if (!phrase.verbPhrase) return subj.trim();
  // A `no` subject is the clause's negator and takes the other negatives with it (A160). Only the
  // matrix clause's own subject counts: `relativeText` passes a subject relative the head noun's
  // forms for agreement, but a `no` head negates THIS clause, not the relative one.
  const parts = predicateParts(subject.agreement, phrase.verbPhrase, phrase.directObject, phrase.complements,
    subject.agreement['definiteness'] === 'no', phrase.agent);
  // A question puts the finite auxiliary before the subject: "is the server active?".
  const clause = (phrase.verbPhrase.interrogative ? invertSubject(subj, parts) : [subj, ...parts])
    .filter(Boolean)
    .join(' ')
    .trim();
  // An infinitive complement follows the clause as a clause of its own in the infinitive mood, whose
  // "to" is the link every English governor takes: "to be able to act", "the cat desires to eat".
  const governed = phrase.infinitiveComplement ? `${clause} ${renderClause(phrase.infinitiveComplement)}` : clause;
  // A clause of purpose closes the sentence, and English marks it with the bare infinitive the
  // citation mood already gives: "click to change", "select a subject to see the translations".
  return phrase.purpose ? `${governed} ${renderClause(phrase.purpose)}` : governed;
}
