import type { ResolvedPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { isComplementGloss } from '../../functions/isComplementGloss.js';
import { infinitiveController } from '../../functions/infinitiveController.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { complementGloss } from './complementGloss.js';
import { dimensionGloss } from './dimensionGloss.js';
import { SUBORDINATORS } from './it.consts.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isRelativeGloss } from './isRelativeGloss.js';
import { mannerGloss } from './mannerGloss.js';
import { predicateText } from './predicateText.js';
import { relativeText } from './relativeText.js';
import { subjectText } from './subjectText.js';

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
export function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // A verbless period marked as an adjective-definition gloss is a prepositional fragment ("di
  // grande dimensione"), not a bare subject noun phrase — wrap the dimension NP in its adposition.
  if (!phrase.verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
  // A complement-definition gloss ("in tutti i luoghi", "a un luogo più alto") is the place or direction complement
  // that defines an adverb, as a clause renders it.
  if (!phrase.verbPhrase && isComplementGloss(subject)) return complementGloss(subject);
  // A manner-definition gloss ("in un modo buono") is the adverbial fragment defining an adverb.
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(subject);
  // A relative-clause gloss ("che si è salvato") is the head's relative alone, still agreeing with it.
  if (!phrase.verbPhrase && isRelativeGloss(subject)) return relativeText(firstConjunct(subject));
  // Italian is null-subject (pro-drop): a bare pronoun subject is dropped by default, the verb
  // ending alone carrying the person ("mangio", not "io mangio"). An imperative likewise drops its
  // subject; both keep driving the verb form off subject.agreement (see predicateText). A noun
  // subject and a coordination fall through to subjectText and keep their surface.
  const dropSubject = !!phrase.verbPhrase &&
    (phrase.verbPhrase.mood === 'imperative' ||
      phrase.verbPhrase.mood === 'infinitive' ||
      isPronounElement(subject));
  // A content clause standing where the subject would is extraposed behind the predicate, under
  // "che" / "que" and in the present subjunctive; these languages write no expletive in the slot it
  // left, because they write no subject pronoun at all (C30).
  const contentSubject = phrase.contentSubject;
  const subj = contentSubject || dropSubject ? '' : subjectText(subject);
  // Verbless period: a bare noun phrase ("ultime notizie").
  if (!phrase.verbPhrase) return subj.trim();
  // A citation's subject is nobody: the generic subject it carries only satisfies the plan, so its
  // predicate adjective takes the citation form, "essere attento", not the masculine plural the
  // impersonal si would ask for ("si è attenti", see `agreementForms`).
  const agreement = phrase.verbPhrase.mood === 'infinitive' ? withoutGeneric(subject.agreement) : subject.agreement;
  const predicate = predicateText(
    agreement, phrase.verbPhrase, phrase.directObject, phrase.complements, phrase.agent,
  );
  // An infinitive complement follows the clause, agreeing with its controller — this clause's
  // subject ("essere capace di agire", "la gatta desidera essere attenta") or, under a causative,
  // its object ("indurre una casa a essere nascosta").
  const complement = phrase.infinitiveComplement
    ? infinitiveComplementText(phrase.infinitiveComplement, infinitiveController(phrase, agreement), infinitiveLink(phrase))
    : '';
  // A clause of purpose closes the sentence, under the final preposition every Romance language
  // puts before the infinitive: "per cambiare", "per vedere le traduzioni". It is subject-controlled,
  // so it agrees with this clause's own subject, exactly as an infinitive complement does.
  const purpose = phrase.purpose ? infinitiveComplementText(phrase.purpose, agreement, 'per') : '';
  // The content clause closes the phrase, under "che" and in the present subjunctive the
  // translator resolved it in (C30).
  const content = contentSubject ? `che ${renderClause(contentSubject)}` : '';
  // An object clause takes the same place under "che", in the mood its verb's lexeme names — the
  // indicative an assertion takes unless it says otherwise — and nothing stands in the object slot for
  // it (P09-E4).
  const object = phrase.contentObject ? `che ${renderClause(phrase.contentObject)}` : '';
  // An adverbial clause closes the sentence under its conjunction, in the mood that conjunction
  // governs (P09-E4).
  const adverbial = phrase.adverbialClause
    ? `${SUBORDINATORS[phrase.adverbialClause.conjunction]} ${renderClause(phrase.adverbialClause.clause)}`
    : '';
  return [subj, predicate, content, object, complement, purpose, adverbial].filter(Boolean).join(' ').trim();
}

function withoutGeneric(forms: Record<string, string>): Record<string, string> {
  const { generic: _, ...rest } = forms;
  return rest;
}
