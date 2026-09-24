import type { ResolvedPhrase } from '../../types.js';
import { questionStandIn } from '../../functions/questionGapComplement.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { foldModalGovernor } from '../../functions/foldModalGovernor.js';
import { isComplementGloss } from '../../functions/isComplementGloss.js';
import { complementGloss } from './complementGloss.js';
import { dimensionGloss } from './dimensionGloss.js';
import { SUBORDINATORS } from './en.consts.js';
import { invertSubject } from './invertSubject.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isRelativeGloss } from './isRelativeGloss.js';
import { mannerGloss } from './mannerGloss.js';
import { objectComplementizer } from '../../functions/objectComplementizer.js';
import { npText } from './npText.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { predicateParts } from './predicateParts.js';
import { questionWord, strandedGap } from './questionWord.js';
import { relativeText } from './relativeText.js';
import { subjectText } from './subjectText.js';
import { withSentenceAdverb } from '../../functions/withSentenceAdverb.js';

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
export function renderClause(given: ResolvedPhrase): string {
  // A sentence adverb opens the statement, outside its negation (P09-E39, see `liftSentenceAdverb`).
  if (given.sentenceAdverb) return withSentenceAdverb(given.sentenceAdverb, renderClause({ ...given, sentenceAdverb: undefined }));
  // A modal governing an infinitive is the modal chain over it: "to be able to act", never "to can to
  // act" (A222, see `foldModalGovernor`).
  const phrase = foldModalGovernor(given);
  const { subject } = phrase;
  // A verbless period marked as an adjective-definition gloss is a prepositional fragment ("of
  // great size"), not a bare subject noun phrase — wrap the dimension NP in its adposition.
  if (!phrase.verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
  // A verbless period marked as a complement-definition gloss is the place or direction complement
  // that defines an adverb ("in all places", "to a higher place"), as a clause renders it.
  if (!phrase.verbPhrase && isComplementGloss(subject)) return complementGloss(subject);
  // A verbless period marked as a manner-definition gloss is the adverbial fragment that defines an
  // adverb ("at high speed"), the manner noun phrase under the adposition its `mannerRelation` picks.
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(firstConjunct(subject), subject);
  // A verbless period marked as a relative-clause gloss is the head's relative alone ("that one has
  // saved"): the head is unsaid, but it is still the antecedent the relativizer reads (who / that).
  if (!phrase.verbPhrase && isRelativeGloss(subject)) return relativeText(firstConjunct(subject));
  // An imperative drops its subject from the surface, but the subject's person/number still
  // drives the choice of imperative form (2nd person vs "let's …"), so it is kept for agreement.
  // An infinitive citation ("to consume food") is likewise subject-less on the surface.
  const dropsSubject =
    phrase.verbPhrase?.mood === 'imperative' || phrase.verbPhrase?.mood === 'infinitive';
  // A content clause standing where the subject would is extraposed behind the predicate, and the
  // slot it left takes the expletive "it": "it is right that one acts" (C30).
  const contentSubject = phrase.contentSubject;
  // A subject wh-question writes its word in the subject's own slot (P09-E6). A possessor question
  // inside the subject writes the subject itself, *whose* in its Saxon slot, and is a subject
  // question for the order: "whose cat eats the food?" (P09-E14). Inside the object it fronts the
  // whole object phrase, which leaves the object slot: "whose food does the cat eat?".
  const gap = phrase.question;
  const subjectAsked = gap?.role === 'subject' || (gap?.role === 'possessor' && gap.possessed === 'subject');
  const objectPossessed = gap?.role === 'possessor' && gap.possessed === 'directObject' ? phrase.directObject : undefined;
  // An existential's subject slot takes the expletive "there", the pivot following the verb as its
  // object does and the verb agreeing with it: "there are cats in the house", "is there a cat?"
  // (P09-E6 D5, see `withExistential`).
  const subj = contentSubject ? 'it' : dropsSubject ? '' : gap?.role === 'subject' ? questionWord(gap)
    : phrase.verbPhrase?.existential ? 'there' : subjectText(subject);
  // Verbless period: a bare noun phrase ("breaking news").
  if (!phrase.verbPhrase) return subj.trim();
  // A `no` subject is the clause's negator and takes the other negatives with it (A160). Only the
  // matrix clause's own subject counts: `relativeText` passes a subject relative the head noun's
  // forms for agreement, but a `no` head negates THIS clause, not the relative one.
  // A question puts the verb ahead of the subject, so an "or" group agrees with its first conjunct,
  // the one nearest the verb (A210): "do the cats or the dog run?".
  // A wh-question over the **subject** is the one that does not invert — its word already stands
  // where the subject does, ahead of the verb — so it takes no do-support either: "who eats the
  // food?", "who does not eat?" (P09-E6). Every other question inverts.
  const inverts = !!phrase.verbPhrase.interrogative && !subjectAsked;
  const verbPhrase = inverts || !phrase.verbPhrase.interrogative ? phrase.verbPhrase : { ...phrase.verbPhrase, interrogative: false };
  const agreement = inverts ? subject.invertedAgreement ?? subject.agreement : subject.agreement;
  // A complement question strands its preposition in the complement's own slot: "what does the cat
  // eat under?", "who does the man give the book to?" (P09-E15, see `strandedGap`).
  // A passive's agent asked about strands its "by" the same way, after the participle: "who is the
  // food eaten by?" (P09-E16).
  const stranding = strandedGap(gap, phrase.verbPhrase.verb);
  const agent = gap?.role === 'agent' ? questionStandIn(gap, { base: '' }) : phrase.agent;
  const parts = predicateParts(agreement, verbPhrase, objectPossessed ? undefined : phrase.directObject,
    stranding ? { ...phrase.complements, ...stranding } : phrase.complements,
    subject.agreement['definiteness'] === 'no', agent);
  // A question puts the finite auxiliary before the subject: "is the server active?". A wh-question
  // fronts its word ahead of that — "what does the cat eat?", "why does the cat eat?" — and a verb
  // that takes its object with a preposition strands it: "what does the cat click on?".
  const fronted = objectPossessed ? npText(firstConjunct(objectPossessed)) : gap && !subjectAsked ? questionWord(gap) : '';
  const stranded = gap?.role === 'directObject' || objectPossessed ? objectPreposition(phrase.verbPhrase.verb) : '';
  // A stranded complement's empty stand-in leaves its preposition a trailing space, which the
  // collapse below closes up: "what does the man cut the book with in the house?" (P09-E15).
  const joined = [fronted, ...(inverts ? invertSubject(subj, parts) : [subj, ...parts]), stranded].filter(Boolean).join(' ');
  const clause = (stranding || gap?.role === 'agent' ? joined.replace(/ {2,}/g, ' ') : joined).trim();
  // An infinitive complement follows the clause as a clause of its own in the infinitive mood, whose
  // "to" is the link every English governor takes: "to be able to act", "the cat desires to eat".
  const withContent = contentSubject ? `${clause} that ${renderClause(contentSubject)}` : clause;
  // An object clause follows the verb group under "that", and the object slot takes nothing: "the man
  // says that the cat runs". Its clause never inverts, whatever this one does (P09-E4). An indirect
  // question opens on "whether", or on its own word with no inversion and no do-support — "asks what
  // the cat eats" — since the translator does not flag it interrogative (P09-E17).
  const withObject = phrase.contentObject
    ? [withContent, objectComplementizer(phrase.contentObject, 'that', 'whether'), renderClause(phrase.contentObject)].filter(Boolean).join(' ')
    : withContent;
  const governed = phrase.infinitiveComplement ? `${withObject} ${renderClause(phrase.infinitiveComplement)}` : withObject;
  // A clause of purpose closes the sentence, and English marks it with the bare infinitive the
  // citation mood already gives: "click to change", "select a subject to see the translations".
  const purposed = phrase.purpose ? `${governed} ${renderClause(phrase.purpose)}` : governed;
  // An adverbial clause follows everything, under its conjunction and with no comma: "the man runs
  // when the cat eats" (P09-E4).
  return phrase.adverbialClause
    ? `${purposed} ${SUBORDINATORS[phrase.adverbialClause.conjunction]} ${renderClause(phrase.adverbialClause.clause)}`
    : purposed;
}
