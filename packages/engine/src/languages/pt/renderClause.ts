import type { ResolvedPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { isComplementGloss } from '../../functions/isComplementGloss.js';
import { infinitiveController } from '../../functions/infinitiveController.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { complementGloss } from './complementGloss.js';
import { dimensionGloss } from './dimensionGloss.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isRelativeGloss } from './isRelativeGloss.js';
import { mannerGloss } from './mannerGloss.js';
import { predicateText } from './predicateText.js';
import { questionWord } from './questionWord.js';
import { relativeGloss } from './relativeGloss.js';
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
  // A complement-definition gloss ("em todos os lugares", "a um lugar mais alto") is the place or direction complement
  // that defines an adverb, as a clause renders it.
  if (!phrase.verbPhrase && isComplementGloss(subject)) return complementGloss(subject);
  // A manner-definition gloss ("a velocidade alta") is the adverbial fragment defining an adverb.
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(subject);
  // A relative-clause gloss ("que se salvou") is the head's relative alone, still agreeing with it.
  if (!phrase.verbPhrase && isRelativeGloss(subject)) return relativeGloss(firstConjunct(subject));
  // Portuguese is null-subject (pro-drop): a bare pronoun subject is dropped by default, the verb
  // ending alone carrying the person ("como", not "eu como"). An imperative likewise drops its
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
  const spoken = contentSubject || dropSubject ? '' : subjectText(subject);
  // Verbless period: a bare noun phrase ("últimas notícias").
  if (!phrase.verbPhrase) return spoken.trim();
  // A wh-question fronts its word and keeps the statement's order behind it — "o que o gato come?",
  // "onde o gato come?" — the everyday Portuguese question, as the yes/no one keeps it too; over the
  // subject the word stands in the subject's slot, "quem come a comida?" (P09-E6).
  const gap = phrase.question;
  const word = gap ? questionWord(gap, phrase.verbPhrase.verb) : '';
  const subj = gap?.role === 'subject' ? word : [word, spoken].filter(Boolean).join(' ');
  // Something fronted leads the clause, so a clitic no longer opens it ("o que me dá?"). A place asked
  // about is the gap, and predicates as a spoken one does: "onde o gato está?" (the relative's A199).
  const predicate = predicateText(
    subject.agreement, phrase.verbPhrase, phrase.directObject, phrase.complements, dropSubject && !subordinate && !gap, phrase.agent,
    subject.agreement['definiteness'] === 'no', gap?.role === 'locative' ? 'locative' : undefined,
  );
  // An infinitive complement follows the clause, agreeing with its controller — this clause's
  // subject ("ser capaz de agir", "o gato deseja comer") or, under a causative, its object
  // ("levar uma casa a estar oculta").
  const complement = phrase.infinitiveComplement
    ? infinitiveComplementText(phrase.infinitiveComplement, infinitiveController(phrase, subject.agreement), infinitiveLink(phrase))
    : '';
  // A clause of purpose closes the sentence, under the final preposition every Romance language
  // puts before the infinitive: "para cambiare", "para vedere le traduzioni". It is subject-controlled,
  // so it agrees with this clause's own subject, exactly as an infinitive complement does.
  const purpose = phrase.purpose ? infinitiveComplementText(phrase.purpose, subject.agreement, 'para') : '';
  // The content clause closes the phrase, under "que" and in the present subjunctive the
  // translator resolved it in (C30).
  const content = contentSubject ? `que ${renderClause(contentSubject)}` : '';
  return [subj, predicate, content, complement, purpose].filter(Boolean).join(' ').trim();
}
