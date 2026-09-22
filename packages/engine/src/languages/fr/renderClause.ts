import type { ResolvedPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { isComplementGloss } from '../../functions/isComplementGloss.js';
import { infinitiveController } from '../../functions/infinitiveController.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { complementGloss } from './complementGloss.js';
import { dimensionGloss } from './dimensionGloss.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isRelativeGloss } from './isRelativeGloss.js';
import { joinSubject } from './joinSubject.js';
import { mannerGloss } from './mannerGloss.js';
import { predicateText } from './predicateText.js';
import { relativeText } from './relativeText.js';
import { subjectText } from './subjectText.js';

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
export function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // A verbless period marked as an adjective-definition gloss is a prepositional fragment ("de
  // grande taille"), not a bare subject noun phrase — wrap the dimension NP in its adposition.
  if (!phrase.verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
  // A complement-definition gloss ("dans tous les lieux", "à un lieu plus haut") is the place or direction complement
  // that defines an adverb, as a clause renders it.
  if (!phrase.verbPhrase && isComplementGloss(subject)) return complementGloss(subject);
  // A manner-definition gloss ("à vitesse haute") is the adverbial fragment defining an adverb.
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(subject);
  // A relative-clause gloss ("qu'on a enregistré") is the head's relative alone, still agreeing with it.
  if (!phrase.verbPhrase && isRelativeGloss(subject)) return relativeText(firstConjunct(subject));
  // An imperative drops its subject (the person still drives the form — see predicateText); an
  // infinitive citation ("consommer la nourriture") is likewise subject-less on the surface.
  // A content clause standing where the subject would is extraposed behind the predicate, under
  // "que" and in the present subjunctive; the slot it left takes the expletive "il" (C30).
  const contentSubject = phrase.contentSubject;
  const subj = contentSubject ? 'il'
    : phrase.verbPhrase?.mood === 'imperative' || phrase.verbPhrase?.mood === 'infinitive'
      ? ''
      : subjectText(subject);
  // Verbless period: a bare noun phrase ("dernières nouvelles").
  if (!phrase.verbPhrase) return subj.trim();
  const predicate = predicateText(
    subject.agreement, phrase.verbPhrase, phrase.directObject, phrase.complements, undefined, phrase.agent,
  );
  const clause = joinSubject(subj, predicate, phrase.verbPhrase.verb.forms).trim();
  // An infinitive complement follows the clause, agreeing with its controller — this clause's
  // subject ("être capable d'agir", "le chat désire manger") or, under a causative, its object
  // ("amener une maison à être cachée").
  // "que" elides before a vowel, as it does everywhere else: "qu'on agisse".
  const withContent = contentSubject
    ? `${clause} ${((text) => (/^[aeiouyâêîôûéèh]/i.test(text) ? `qu'${text}` : `que ${text}`))(renderClause(contentSubject))}`
    : clause;
  const governed = phrase.infinitiveComplement
    ? `${withContent} ${infinitiveComplementText(phrase.infinitiveComplement, infinitiveController(phrase, subject.agreement), infinitiveLink(phrase))}`
    : withContent;
  // A clause of purpose closes the sentence, under "pour" + the infinitive ("cliquer pour changer").
  // It is subject-controlled, so it agrees with this clause's own subject, as a complement does.
  return phrase.purpose
    ? `${governed} ${infinitiveComplementText(phrase.purpose, subject.agreement, 'pour')}`
    : governed;
}
