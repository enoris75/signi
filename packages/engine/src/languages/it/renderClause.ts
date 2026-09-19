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

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
export function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // A verbless period marked as an adjective-definition gloss is a prepositional fragment ("di
  // grande dimensione"), not a bare subject noun phrase — wrap the dimension NP in its adposition.
  if (!phrase.verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
  // A manner-definition gloss ("in un modo buono") is the adverbial fragment defining an adverb.
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(subject);
  // Italian is null-subject (pro-drop): a bare pronoun subject is dropped by default, the verb
  // ending alone carrying the person ("mangio", not "io mangio"). An imperative likewise drops its
  // subject; both keep driving the verb form off subject.agreement (see predicateText). A noun
  // subject and a coordination fall through to subjectText and keep their surface.
  const dropSubject = !!phrase.verbPhrase &&
    (phrase.verbPhrase.mood === 'imperative' ||
      phrase.verbPhrase.mood === 'infinitive' ||
      isPronounElement(subject));
  const subj = dropSubject ? '' : subjectText(subject);
  // Verbless period: a bare noun phrase ("ultime notizie").
  if (!phrase.verbPhrase) return subj.trim();
  // A citation's subject is nobody: the generic subject it carries only satisfies the plan, so its
  // predicate adjective takes the citation form, "essere attento", not the masculine plural the
  // impersonal si would ask for ("si è attenti", see `agreementForms`).
  const agreement = phrase.verbPhrase.mood === 'infinitive' ? withoutGeneric(subject.agreement) : subject.agreement;
  const predicate = predicateText(
    agreement, phrase.verbPhrase, phrase.directObject, phrase.complements,
  );
  // An infinitive complement follows the clause, agreeing with the same subject ("essere capace di
  // agire", "la gatta desidera essere attenta").
  const complement = phrase.infinitiveComplement
    ? infinitiveComplementText(phrase.infinitiveComplement, agreement, infinitiveLink(phrase))
    : '';
  return [subj, predicate, complement].filter(Boolean).join(' ').trim();
}

function withoutGeneric(forms: Record<string, string>): Record<string, string> {
  const { generic: _, ...rest } = forms;
  return rest;
}
