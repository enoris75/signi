import type { ResolvedPhrase } from '../../types.js';
import { possessedPrepObject, withoutQuestionPossessor } from '../../functions/questionPossessor.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { isComplementGloss } from '../../functions/isComplementGloss.js';
import { infinitiveController } from '../../functions/infinitiveController.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { complementGloss } from './complementGloss.js';
import { dimensionGloss } from './dimensionGloss.js';
import { indirectQuestionWord } from './indirectQuestionWord.js';
import { SUBORDINATORS } from './fr.consts.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isRelativeGloss } from './isRelativeGloss.js';
import { joinSubject } from './joinSubject.js';
import { mannerGloss } from './mannerGloss.js';
import { objectClauseText } from './objectClauseText.js';
import { predicateText } from './predicateText.js';
import { questionWord } from './questionWord.js';
import { relativeText } from './relativeText.js';
import { subjectText } from './subjectText.js';
import { subordinateText } from './subordinateText.js';
import { withSentenceAdverb } from '../../functions/withSentenceAdverb.js';
import { VOWEL_START } from './fr.consts.js';

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
export function renderClause(phrase: ResolvedPhrase): string {
  // A sentence adverb opens the statement (P09-E39); fronted *peut-être* takes *que*, elided as
  // "que" always is: "peut-être qu'il mange".
  if (phrase.sentenceAdverb) {
    return withSentenceAdverb(phrase.sentenceAdverb, renderClause({ ...phrase, sentenceAdverb: undefined }),
      (c) => (VOWEL_START.test(c) ? `qu'${c}` : `que ${c}`));
  }
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
      // A subject wh-question writes its word in the subject's slot, and asks with no "est-ce que":
      // "qui mange la nourriture ?" (P09-E6). An indirect one writes its own: "ce qui mange" (P09-E17).
      : phrase.question?.role === 'subject' && phrase.verbPhrase
        ? (phrase.embedded ? indirectQuestionWord : questionWord)(phrase.question, phrase.verbPhrase.verb)
        // A verbless period (the vocative, A349) writes a pronoun group without its resumption.
        : subjectText(subject, !!phrase.verbPhrase);
  // Verbless period: a bare noun phrase ("dernières nouvelles").
  if (!phrase.verbPhrase) return subj.trim();
  // A possessor question over the object fronts its *de qui* alone, and the object stays behind it,
  // definite (P09-E14, see `withoutQuestionPossessor`) — unless the verb takes its object with a
  // preposition, which fronts whole (`possessedPrepObject`, see `frenchEngine`).
  const predicate = predicateText(
    subject.agreement, phrase.verbPhrase,
    possessedPrepObject(phrase) ? undefined : withoutQuestionPossessor(phrase.directObject, phrase.question), phrase.complements,
    undefined, phrase.agent,
  );
  const clause = joinSubject(subj, predicate, phrase.verbPhrase.verb.forms).trim();
  // An infinitive complement follows the clause, agreeing with its controller — this clause's
  // subject ("être capable d'agir", "le chat désire manger") or, under a causative, its object
  // ("amener une maison à être cachée").
  // "que" elides before a vowel, as it does everywhere else: "qu'on agisse".
  const withContent = contentSubject
    ? `${clause} ${((text) => (/^[aeiouyâêîôûéèh]/i.test(text) ? `qu'${text}` : `que ${text}`))(renderClause(contentSubject))}`
    : clause;
  // An object clause follows under "que", in the mood its verb's lexeme names, and the object slot
  // takes no expletive: "l'homme dit que le chat court" (P09-E4). An indirect question opens on "si"
  // or on its word, in the statement's order: "demande ce que le chat mange" (P09-E17).
  const withObject = phrase.contentObject
    ? `${withContent} ${objectClauseText(phrase.contentObject, renderClause(phrase.contentObject))}`
    : withContent;
  const governed = phrase.infinitiveComplement
    ? `${withObject} ${infinitiveComplementText(phrase.infinitiveComplement, infinitiveController(phrase, subject.agreement), infinitiveLink(phrase))}`
    : withObject;
  // A clause of purpose closes the sentence, under "pour" + the infinitive ("cliquer pour changer").
  // It is subject-controlled, so it agrees with this clause's own subject, as a complement does.
  const purposed = phrase.purpose
    ? `${governed} ${infinitiveComplementText(phrase.purpose, subject.agreement, 'pour')}`
    : governed;
  // An adverbial clause follows everything, under its conjunction, in the mood that conjunction
  // governs: "l'homme court parce que le chat mange", "… avant que le chat mange" (P09-E4).
  return phrase.adverbialClause
    ? `${purposed} ${subordinateText(SUBORDINATORS[phrase.adverbialClause.conjunction], renderClause(phrase.adverbialClause.clause))}`
    : purposed;
}
