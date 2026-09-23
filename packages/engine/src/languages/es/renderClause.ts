import type { ResolvedPhrase } from '../../types.js';
import { prepObjectText } from './prepObjectText.js';
import { possessedPrepObject, withoutQuestionPossessor } from '../../functions/questionPossessor.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { isComplementGloss } from '../../functions/isComplementGloss.js';
import { infinitiveController } from '../../functions/infinitiveController.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { complementGloss } from './complementGloss.js';
import { dimensionGloss } from './dimensionGloss.js';
import { SUBORDINATORS } from './es.consts.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isRelativeGloss } from './isRelativeGloss.js';
import { mannerGloss } from './mannerGloss.js';
import { predicateText } from './predicateText.js';
import { questionOrder } from './questionOrder.js';
import { relativeGloss } from './relativeGloss.js';
import { subjectText } from './subjectText.js';

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
export function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // A verbless period marked as an adjective-definition gloss is a prepositional fragment ("de gran
  // tamaño"), not a bare subject noun phrase — wrap the dimension NP in its adposition.
  if (!phrase.verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
  // A complement-definition gloss ("en todos los lugares", "a un lugar más alto") is the place or direction complement
  // that defines an adverb, as a clause renders it.
  if (!phrase.verbPhrase && isComplementGloss(subject)) return complementGloss(subject);
  // A manner-definition gloss ("a velocidad alta") is the adverbial fragment defining an adverb.
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(subject);
  // A relative-clause gloss ("que se ha guardado") is the head's relative alone, still agreeing with it.
  if (!phrase.verbPhrase && isRelativeGloss(subject)) return relativeGloss(firstConjunct(subject));
  // Spanish is null-subject (pro-drop): a bare pronoun subject is dropped by default, the verb
  // ending alone carrying the person ("como", not "yo como"). An imperative likewise drops its
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
  // Verbless period: a bare noun phrase ("últimas noticias").
  if (!phrase.verbPhrase) return spoken.trim();
  // A place asked about is the gap, and predicates as a spoken one does: "¿dónde está el gato?", never
  // "*es" (P09-E6; the relative's A199).
  const askedPlace = phrase.question?.role === 'locative' ? 'locative' as const : undefined;
  const noSubject = subject.agreement['definiteness'] === 'no';
  // A possessor question over the object fronts its *de quién* alone, and the object stays behind it,
  // definite (P09-E14, see `withoutQuestionPossessor`) — unless the verb takes its object with a
  // preposition, which fronts whole: "¿de la casa de quién depende el gato?" (`possessedPrepObject`).
  const prepFront = possessedPrepObject(phrase);
  const statement = predicateText(
    subject.agreement, phrase.verbPhrase,
    prepFront ? undefined : withoutQuestionPossessor(phrase.directObject, phrase.question), phrase.complements,
    phrase.agent, noSubject, askedPlace,
  );
  // A wh-question fronts its word and puts the subject behind the verb group, which is the predicate
  // with nothing after the verb (P09-E6).
  const verbGroup = phrase.question && spoken
    ? predicateText(subject.agreement, phrase.verbPhrase, undefined, undefined, undefined, noSubject, askedPlace)
    : '';
  const [subj, predicate] = questionOrder(phrase.question, spoken, statement, verbGroup, phrase.verbPhrase.verb,
    prepFront ? prepObjectText(prepFront.np, prepFront.prep) : undefined);
  // An infinitive complement follows the clause, agreeing with its controller — this clause's
  // subject ("ser capaz de actuar", "el gato desea comer") or, under a causative, its object
  // ("llevar una casa a estar oculta").
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
  // An object clause takes the same place under "que", in the mood its verb's lexeme names — the
  // indicative an assertion takes unless it says otherwise — and nothing stands in the object slot for
  // it (P09-E4).
  const object = phrase.contentObject ? `que ${renderClause(phrase.contentObject)}` : '';
  // An adverbial clause closes the sentence under its conjunction, in the mood that conjunction
  // governs (P09-E4).
  const adverbial = phrase.adverbialClause
    ? `${SUBORDINATORS[phrase.adverbialClause.conjunction]} ${renderClause(phrase.adverbialClause.clause)}`
    : '';
  return [subj, predicate, content, object, complement, purpose, adverbial].filter(Boolean).join(' ').trim();
}
