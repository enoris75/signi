import type { ResolvedPhrase } from '../../types.js';
import { firstConjunct } from '../../resolved/firstConjunct.js';
import { dimensionGloss } from './dimensionGloss.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { mannerGloss } from './mannerGloss.js';
import { predicateParts } from './predicateParts.js';
import { subjectText } from './subjectText.js';

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
export function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // A verbless period marked as an adjective-definition gloss is a prepositional fragment ("of
  // great size"), not a bare subject noun phrase — wrap the dimension NP in its adposition.
  if (!phrase.verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
  // A verbless period marked as a manner-definition gloss is the adverbial fragment that defines an
  // adverb ("at high speed"), the manner noun phrase under the adposition its `mannerRelation` picks.
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(firstConjunct(subject), subject);
  // An imperative drops its subject from the surface, but the subject's person/number still
  // drives the choice of imperative form (2nd person vs "let's …"), so it is kept for agreement.
  // An infinitive citation ("to consume food") is likewise subject-less on the surface.
  const dropsSubject =
    phrase.verbPhrase?.mood === 'imperative' || phrase.verbPhrase?.mood === 'infinitive';
  const subj = dropsSubject ? '' : subjectText(subject);
  // Verbless period: a bare noun phrase ("breaking news").
  if (!phrase.verbPhrase) return subj.trim();
  return [
    subj,
    ...predicateParts(subject.agreement, phrase.verbPhrase, phrase.directObject, phrase.complements),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}
