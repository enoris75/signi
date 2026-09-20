import type { ResolvedPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { infinitiveController } from '../../functions/infinitiveController.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { dimensionGloss } from './dimensionGloss.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { joinSubject } from './joinSubject.js';
import { mannerGloss } from './mannerGloss.js';
import { predicateText } from './predicateText.js';
import { subjectText } from './subjectText.js';

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
export function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // A verbless period marked as an adjective-definition gloss is a prepositional fragment ("de
  // grande taille"), not a bare subject noun phrase — wrap the dimension NP in its adposition.
  if (!phrase.verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
  // A manner-definition gloss ("à vitesse haute") is the adverbial fragment defining an adverb.
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(subject);
  // An imperative drops its subject (the person still drives the form — see predicateText); an
  // infinitive citation ("consommer la nourriture") is likewise subject-less on the surface.
  const subj =
    phrase.verbPhrase?.mood === 'imperative' || phrase.verbPhrase?.mood === 'infinitive'
      ? ''
      : subjectText(subject);
  // Verbless period: a bare noun phrase ("dernières nouvelles").
  if (!phrase.verbPhrase) return subj.trim();
  const predicate = predicateText(
    subject.agreement, phrase.verbPhrase, phrase.directObject, phrase.complements,
  );
  const clause = joinSubject(subj, predicate).trim();
  // An infinitive complement follows the clause, agreeing with its controller — this clause's
  // subject ("être capable d'agir", "le chat désire manger") or, under a causative, its object
  // ("amener une maison à être cachée").
  return phrase.infinitiveComplement
    ? `${clause} ${infinitiveComplementText(phrase.infinitiveComplement, infinitiveController(phrase, subject.agreement), infinitiveLink(phrase))}`
    : clause;
}
