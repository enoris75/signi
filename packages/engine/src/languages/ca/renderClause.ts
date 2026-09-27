import type { ResolvedPhrase } from '../../types.js';
import { prepObjectText } from './prepObjectText.js';
import { possessedPrepObject, withoutQuestionPossessor } from '../../functions/questionPossessor.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { isComplementGloss } from '../../functions/isComplementGloss.js';
import { infinitiveController } from '../../functions/infinitiveController.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { objectComplementizer } from '../../functions/objectComplementizer.js';
import { complementGloss } from './complementGloss.js';
import { dimensionGloss } from './dimensionGloss.js';
import { SUBORDINATORS } from './ca.consts.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isRelativeGloss } from './isRelativeGloss.js';
import { mannerGloss } from './mannerGloss.js';
import { complementsPhrase } from './complementsPhrase.js';
import { predicateText } from './predicateText.js';
import { questionOrder } from './questionOrder.js';
import { relativeGloss } from './relativeGloss.js';
import { subjectText } from './subjectText.js';
import { withSentenceAdverb } from '../../functions/withSentenceAdverb.js';
import { caSurface } from './caSurface.js';
import { experiencerInverts } from '../../functions/experiencerInverts.js';

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
export function renderClause(phrase: ResolvedPhrase): string {
  // A sentence adverb opens the statement, outside its negation (P09-E39, see `liftSentenceAdverb`).
  if (phrase.sentenceAdverb) return withSentenceAdverb(phrase.sentenceAdverb, renderClause({ ...phrase, sentenceAdverb: undefined }));
  const { subject } = phrase;
  // A verbless period marked as an adjective-definition gloss is a prepositional fragment ("de gran
  // tamaño"), not a bare subject noun phrase — wrap the dimension NP in its adposition.
  if (!phrase.verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
  // A complement-definition gloss ("a tots els llocs", "a un lloc més alt") is the place or direction complement
  // that defines an adverb, as a clause renders it.
  if (!phrase.verbPhrase && isComplementGloss(subject)) return complementGloss(subject);
  // A manner-definition gloss ("a velocitat alta") is the adverbial fragment defining an adverb.
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(subject);
  // A relative-clause gloss ("que s'ha desat") is the head's relative alone, still agreeing with it.
  if (!phrase.verbPhrase && isRelativeGloss(subject)) return relativeGloss(firstConjunct(subject));
  // An adverbial gloss is the adverbial clause said alone, as it follows a verb ("com s'espera",
  // C41): the translator keeps a verbless period's adverbial clause only when the plan asks for it.
  if (!phrase.verbPhrase && phrase.adverbialClause) return adverbialText(phrase.adverbialClause);
  // Catalan is null-subject (pro-drop): a bare pronoun subject is dropped by default, the verb
  // ending alone carrying the person ("menjo", not "jo menjo"). An imperative likewise drops its
  // subject; both keep driving the verb form off subject.agreement (see predicateText). A noun
  // subject and a coordination fall through to subjectText and keep their surface.
  const dropSubject = !!phrase.verbPhrase &&
    (phrase.verbPhrase.mood === 'imperative' ||
      phrase.verbPhrase.mood === 'infinitive' ||
      isPronounElement(subject));
  // A content clause standing where the subject would is extraposed behind the predicate, under
  // "que" and in the present subjunctive; these languages write no expletive in the slot it
  // left, because they write no subject pronoun at all (C30).
  const contentSubject = phrase.contentSubject;
  const spoken = contentSubject || dropSubject ? '' : subjectText(subject);
  // Verbless period: a bare noun phrase ("últimes notícies").
  if (!phrase.verbPhrase) return spoken.trim();
  // A place asked about is the gap, and predicates as a spoken one does: "on és el gat?" (P09-E6; the
  // relative's A199). An experiencer's dative asked about is the gap its clitic
  // doubles: "a qui **li** agrada el gos?" (A368).
  const askedPlace = phrase.question?.role === 'locative' || phrase.question?.role === 'terminus'
    ? phrase.question.role : undefined;
  const noSubject = subject.agreement['definiteness'] === 'no';
  // A possessor question over the object fronts its *de quién* alone, and the object stays behind it,
  // definite (P09-E14, see `withoutQuestionPossessor`) — unless the verb takes its object with a
  // preposition, which fronts whole: "de la casa de qui depèn el gat?" (`possessedPrepObject`).
  const prepFront = possessedPrepObject(phrase);
  // An experiencer clause leads with its dative and says its subject after the verb (A369, see
  // `experiencerInverts`): "al gat li agrada el gos", "a un li agrada el gat". A pronoun dative is
  // its clitic alone, "m'agrada un àngel". A negative subject behind the verb takes the *no* an object
  // would: "al gat no li agrada cap gos".
  const inverts = experiencerInverts(phrase);
  const terminus = phrase.complements?.['terminus'];
  const fronted = inverts && !!terminus && (!isPronounElement(terminus.phrase) || terminus.phrase.agreement['generic'] === '1');
  const statement = predicateText(
    subject.agreement, phrase.verbPhrase,
    prepFront ? undefined : withoutQuestionPossessor(phrase.directObject, phrase.question), phrase.complements,
    phrase.agent, inverts ? false : noSubject, askedPlace,
    inverts ? { text: spoken, negative: noSubject } : undefined, fronted,
  );
  const lead = fronted ? complementsPhrase({ terminus }, subject.agreement, phrase.verbPhrase.verb.conceptId) : inverts ? '' : spoken;
  // A wh-question fronts its word and puts the subject behind the verb group, which is the predicate
  // with nothing after the verb (P09-E6).
  const verbGroup = phrase.question && spoken
    ? predicateText(subject.agreement, phrase.verbPhrase, undefined, undefined, undefined, noSubject, askedPlace)
    : '';
  const [subj, predicate] = questionOrder(phrase.question, lead, statement, verbGroup, phrase.verbPhrase.verb,
    prepFront ? prepObjectText(prepFront.np, prepFront.prep) : undefined);
  // An infinitive complement follows the clause, agreeing with its controller — this clause's
  // subject ("ser capaç d'actuar", "el gat desitja menjar") or, under a causative, its object
  // ("portar una casa a estar amagada").
  const complement = phrase.infinitiveComplement
    ? infinitiveComplementText(phrase.infinitiveComplement, infinitiveController(phrase, subject.agreement), infinitiveLink(phrase))
    : '';
  // A clause of purpose closes the sentence, under the final preposition every Romance language
  // puts before the infinitive: "per canviar", "per veure les traduccions". It is subject-controlled,
  // so it agrees with this clause's own subject, exactly as an infinitive complement does.
  const purpose = phrase.purpose ? infinitiveComplementText(phrase.purpose, subject.agreement, 'per') : '';
  // The content clause closes the phrase, under "que" and in the present subjunctive the
  // translator resolved it in (C30).
  const content = contentSubject ? `que ${renderClause(contentSubject)}` : '';
  // An object clause takes the same place under "que", in the mood its verb's lexeme names — the
  // indicative an assertion takes unless it says otherwise — and nothing stands in the object slot for
  // it (P09-E4). An indirect question opens on "si", or on its own word with the subject last, as
  // the direct one puts it (P09-E17).
  const object = phrase.contentObject
    ? [objectComplementizer(phrase.contentObject, 'que', 'si'), renderClause(phrase.contentObject)].filter(Boolean).join(' ')
    : '';
  // An adverbial clause closes the sentence under its conjunction, in the mood that conjunction
  // governs (P09-E4).
  const adverbial = phrase.adverbialClause ? adverbialText(phrase.adverbialClause) : '';
  return caSurface([subj, predicate, content, object, complement, purpose, adverbial].filter(Boolean).join(' ').trim());
}

/** An adverbial clause under its conjunction: "quan el gat menja", "com s'espera" (P09-E4, C41). */
function adverbialText({ conjunction, clause }: NonNullable<ResolvedPhrase['adverbialClause']>): string {
  return `${SUBORDINATORS[conjunction]} ${renderClause(clause)}`;
}
