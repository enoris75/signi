import type { ResolvedPhrase } from '../../types.js';
import { prepObjectText } from './prepObjectText.js';
import { possessedPrepObject, withoutQuestionPossessor } from '../../functions/questionPossessor.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { isComplementGloss } from '../../functions/isComplementGloss.js';
import { infinitiveController } from '../../functions/infinitiveController.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { objectComplementizer } from '../../functions/objectComplementizer.js';
import { complementGloss } from './complementGloss.js';
import { dimensionGloss } from './dimensionGloss.js';
import { IF, SUBORDINATORS, THAT, VOWEL_START } from './vallader.consts.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isRelativeGloss } from './isRelativeGloss.js';
import { mannerGloss } from './mannerGloss.js';
import { complementsPhrase } from './complementsPhrase.js';
import { predicateText } from './predicateText.js';
import { questionOrder } from './questionOrder.js';
import { relativeText } from './relativeText.js';
import { subjectText } from './subjectText.js';
import { withCha } from './withCha.js';
import { withSentenceAdverb } from '../../functions/withSentenceAdverb.js';
import { experiencerInverts } from '../../functions/experiencerInverts.js';
import { withoutTerminus } from '../../functions/recipientPronoun.js';

/** The expletive subject Vallader writes where no subject is (the author's draft, verify): *i*, *id* before a vowel — "i dà", "id es bun". */
function expletive(predicate: string): string {
  return VOWEL_START.test(predicate) ? 'id' : 'i';
}

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
export function renderClause(phrase: ResolvedPhrase): string {
  // A sentence adverb opens the statement, outside its negation (P09-E39).
  if (phrase.sentenceAdverb) return withSentenceAdverb(phrase.sentenceAdverb, renderClause({ ...phrase, sentenceAdverb: undefined }), (c) => withCha(THAT, c));
  const { subject } = phrase;
  // The verbless glosses: a dimension ("da grond format"), a place or direction ("in tuot ils lös"),
  // a manner ("in üna buna maniera"), a relative ("chi vain arcunà"), an adverbial clause alone.
  if (!phrase.verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
  if (!phrase.verbPhrase && isComplementGloss(subject)) return complementGloss(subject);
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(subject);
  if (!phrase.verbPhrase && isRelativeGloss(subject)) return relativeText(firstConjunct(subject));
  if (!phrase.verbPhrase && phrase.adverbialClause) return adverbialText(phrase.adverbialClause);
  // Verbless period: a bare noun phrase ("las ultimas novitats").
  if (!phrase.verbPhrase) return subjectText(subject).trim();
  const vp = phrase.verbPhrase;
  // Vallader is not pro-drop (P04-E10 D1, the style sheet): the subject is spoken, a pronoun included —
  // "eu mang", "nus mangiain" — and the generic person is *ins*, a subject like any other ("ins mangia
  // la mür"). A command and an infinitive have none on the surface; the existential and an extraposed
  // content clause take the expletive *i* (P09-E6 D5, C30): "i dà ün giat", "id es bun ch'el cuorra".
  const contentSubject = phrase.contentSubject;
  const silent = vp.mood === 'imperative' || vp.mood === 'infinitive';
  const expletiveSubject = !!contentSubject || vp.existential === true;
  const spoken = silent || expletiveSubject ? '' : subjectText(subject);
  // A possessor question over the object fronts its *da chi* alone (P09-E14), unless the verb takes
  // its object with a preposition, which fronts whole (`possessedPrepObject`).
  const prepFront = possessedPrepObject(phrase);
  // An experiencer clause leads with its dative and says its subject after the verb (A369): "al giat
  // plascha il chan", "a mai plascha il chan" — a pronoun dative is fronted too, as the engine writes no
  // clitic here (P04-E7 D3).
  const inverts = experiencerInverts(phrase);
  const dative = inverts ? phrase.complements!.terminus : undefined;
  const statement = predicateText(
    subject.agreement, vp, prepFront ? undefined : withoutQuestionPossessor(phrase.directObject, phrase.question),
    dative ? withoutTerminus(phrase.complements) : phrase.complements, phrase.agent,
    inverts ? false : undefined,
    inverts ? { text: spoken, negative: subject.agreement['definiteness'] === 'no' } : undefined,
  );
  const lead = inverts
    ? dative ? complementsPhrase({ terminus: dative }, subject.agreement, vp.verb.conceptId, undefined, vp.verb.forms) : ''
    : expletiveSubject ? expletive(statement) : spoken;
  // A wh-question fronts its word and moves the subject behind the predicate (P09-E6).
  const [subj, predicate] = questionOrder(phrase.question, lead, statement, vp.verb,
    prepFront ? prepObjectText(prepFront.np, prepFront.prep) : undefined);
  // An infinitive complement follows the clause, agreeing with its controller (see `infinitiveController`).
  const complement = phrase.infinitiveComplement
    ? infinitiveComplementText(phrase.infinitiveComplement, infinitiveController(phrase, subject.agreement), infinitiveLink(phrase))
    : '';
  // A clause of purpose closes the sentence under *per*: "per müdar", "per verer las traducziuns".
  const purpose = phrase.purpose ? infinitiveComplementText(phrase.purpose, subject.agreement, 'per') : '';
  // The content clause under *cha*, in the mood the translator resolved it in (C30): "id es bun ch'el
  // saja attent".
  const content = contentSubject ? withCha(THAT, renderClause(contentSubject)) : '';
  // An object clause under *cha* (P09-E4), or an indirect question under *scha* or its own word
  // (P09-E17): "eu sa cha'l giat mangia", "eu nu sa scha'l giat mangia".
  const object = phrase.contentObject
    ? withCha(objectComplementizer(phrase.contentObject, THAT, IF), renderClause(phrase.contentObject))
    : '';
  const adverbial = phrase.adverbialClause ? adverbialText(phrase.adverbialClause) : '';
  return [subj, predicate, content, object, complement, purpose, adverbial].filter(Boolean).join(' ').trim();
}

/** An adverbial clause under its conjunction: "cur cha'l giat mangia", "sco ch'ins spetta" (P09-E4, C41). */
function adverbialText(adverbial: NonNullable<ResolvedPhrase['adverbialClause']>): string {
  return withCha(SUBORDINATORS[adverbial.conjunction].word, renderClause(adverbial.clause));
}
