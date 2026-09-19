import type { ResolvedPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { dimensionGloss } from './dimensionGloss.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { mannerGloss } from './mannerGloss.js';
import { predicateText } from './predicateText.js';
import { subjectText } from './subjectText.js';

/**
 * One clause (subject + predicate), ignoring any attached hypothetical condition. A `subordinate`
 * clause follows its conjunction ("se …"), which then precedes the verb for clitic placement.
 */
export function renderClause(phrase: ResolvedPhrase, subordinate = false): string {
  const { subject } = phrase;
  // A verbless period marked as an adjective-definition gloss is a prepositional fragment ("de
  // grande tamanho"), not a bare subject noun phrase — wrap the dimension NP in its adposition.
  if (!phrase.verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
  // A manner-definition gloss ("a velocidade alta") is the adverbial fragment defining an adverb.
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(subject);
  // Portuguese is null-subject (pro-drop): a bare pronoun subject is dropped by default, the verb
  // ending alone carrying the person ("como", not "eu como"). An imperative likewise drops its
  // subject; both keep driving the verb form off subject.agreement (see predicateText). A noun
  // subject and a coordination fall through to subjectText and keep their surface.
  const dropSubject = !!phrase.verbPhrase &&
    (phrase.verbPhrase.mood === 'imperative' ||
      phrase.verbPhrase.mood === 'infinitive' ||
      isPronounElement(subject));
  const subj = dropSubject ? '' : subjectText(subject);
  // Verbless period: a bare noun phrase ("últimas notícias").
  if (!phrase.verbPhrase) return subj.trim();
  const predicate = predicateText(
    subject.agreement, phrase.verbPhrase, phrase.directObject, phrase.complements, dropSubject && !subordinate,
  );
  // An infinitive complement follows the clause, agreeing with the same subject ("ser capaz de agir",
  // "o gato deseja comer").
  const complement = phrase.infinitiveComplement
    ? infinitiveComplementText(phrase.infinitiveComplement, subject.agreement, infinitiveLink(phrase))
    : '';
  return [subj, predicate, complement].filter(Boolean).join(' ').trim();
}
