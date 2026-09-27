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
import { SUBORDINATORS } from './sursilv.consts.js';
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
import { withChe } from './withChe.js';
import { withSentenceAdverb } from '../../functions/withSentenceAdverb.js';
import { experiencerInverts } from '../../functions/experiencerInverts.js';
import { withoutTerminus } from '../../functions/recipientPronoun.js';

/** The expletive subject (style sheet): *ei*, the neuter and impersonal subject — "ei dat", "ei ei bun" (verify). */
const EXPLETIVE = 'ei';

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
export function renderClause(phrase: ResolvedPhrase): string {
  // A sentence adverb opens the statement, outside its negation (P09-E39).
  if (phrase.sentenceAdverb) return withSentenceAdverb(phrase.sentenceAdverb, renderClause({ ...phrase, sentenceAdverb: undefined }), (c) => withChe('che', c));
  const { subject } = phrase;
  // The verbless glosses: a dimension ("da grond format"), a place or direction ("en tut ils lius"),
  // a manner ("en ina buna moda"), a relative ("che vegn memorisà"), an adverbial clause alone.
  if (!phrase.verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
  if (!phrase.verbPhrase && isComplementGloss(subject)) return complementGloss(subject);
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(subject);
  if (!phrase.verbPhrase && isRelativeGloss(subject)) return relativeText(firstConjunct(subject));
  if (!phrase.verbPhrase && phrase.adverbialClause) return adverbialText(phrase.adverbialClause);
  // Verbless period: a bare noun phrase ("ultimas novitads").
  if (!phrase.verbPhrase) return subjectText(subject).trim();
  const vp = phrase.verbPhrase;
  // Sursilvan is not pro-drop (P04-E10 D1, from `fr`): the subject is spoken, a pronoun included — "jeu
  // mangel", "nus mangiain" — and the generic person is *ins*, a subject like any other ("ins maglia la
  // miur"). A command and an infinitive have none on the surface; the existential and an extraposed
  // content clause take the expletive *i* (P09-E6 D5, C30): "i dat in gat", "igl ei bun ch'el cuora".
  const contentSubject = phrase.contentSubject;
  const silent = vp.mood === 'imperative' || vp.mood === 'infinitive';
  const expletiveSubject = !!contentSubject || vp.existential === true;
  const spoken = silent || expletiveSubject ? '' : subjectText(subject);
  // A possessor question over the object fronts its *da tgi* alone (P09-E14), unless the verb takes
  // its object with a preposition, which fronts whole (`possessedPrepObject`).
  const prepFront = possessedPrepObject(phrase);
  // An experiencer clause leads with its dative and says its subject after the verb (A369): "al gat
  // plai il tgaun", "a mei plai il tgaun" — a pronoun dative is fronted too, as Sursilvan has no clitic
  // for it here (P04-E7 D3).
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
    : expletiveSubject ? EXPLETIVE : spoken;
  // A wh-question fronts its word and moves the subject behind the predicate (P09-E6).
  const [subj, predicate] = questionOrder(phrase.question, lead, statement, vp.verb,
    prepFront ? prepObjectText(prepFront.np, prepFront.prep) : undefined);
  // An infinitive complement follows the clause, agreeing with its controller (see `infinitiveController`).
  const complement = phrase.infinitiveComplement
    ? infinitiveComplementText(phrase.infinitiveComplement, infinitiveController(phrase, subject.agreement), infinitiveLink(phrase))
    : '';
  // A clause of purpose closes the sentence under *per*: "per midar", "per vesair las translaziuns".
  const purpose = phrase.purpose ? infinitiveComplementText(phrase.purpose, subject.agreement, 'per') : '';
  // The content clause under *che*, in the mood the translator resolved it in (C30): "igl ei bun ch'el
  // saja attent".
  const content = contentSubject ? withChe('che', renderClause(contentSubject)) : '';
  // An object clause under *che* (P09-E4), or an indirect question under *sche* or its own word
  // (P09-E17): "jeu sai ch'il gat maglia", "jeu sai buca sch'il gat maglia".
  const object = phrase.contentObject
    ? withChe(objectComplementizer(phrase.contentObject, 'che', 'sche'), renderClause(phrase.contentObject))
    : '';
  const adverbial = phrase.adverbialClause ? adverbialText(phrase.adverbialClause) : '';
  return [subj, predicate, content, object, complement, purpose, adverbial].filter(Boolean).join(' ').trim();
}

/** An adverbial clause under its conjunction: "cura ch'il gat maglia", "sco ch'ins spetga" (P09-E4, C41). */
function adverbialText(adverbial: NonNullable<ResolvedPhrase['adverbialClause']>): string {
  return withChe(SUBORDINATORS[adverbial.conjunction].word, renderClause(adverbial.clause));
}
