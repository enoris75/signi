import type { ResolvedNounPhrase } from '../../types.js';
import { isFrequencyAdverb } from '../../functions/isFrequencyAdverb.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativePossessed } from '../../functions/relativePossessed.js';
import { relativeSubjectIsNegative } from '../../functions/relativeSubjectIsNegative.js';
import { adverbSlots } from './adverbSlots.js';
import { agentPhrase } from './agentPhrase.js';
import { complementsPhrase } from './complementsPhrase/index.js';
import { complementsWithNicht } from './complementsWithNicht.js';
import { finiteNegation } from './finiteNegation.js';
import { hasPrepositionalComplement } from './hasPrepositionalComplement.js';
import { meansClause } from './meansClause.js';
import { modalAdverbs } from './modalAdverbs.js';
import { modalVerbGroup } from './modalVerbGroup.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';
import { objectPrepCase } from './objectPrepCase.js';
import { passiveComplex } from './passiveComplex.js';
import { prospectiveFrame } from './prospectiveFrame.js';
import { reflexivePronoun } from './reflexivePronoun.js';
import { relativePronoun } from './relativePronoun.js';
import { splitDative } from './splitDative.js';
import { splitMeansClause } from './splitMeansClause.js';
import { splitObject } from './splitObject.js';
import { subjectText } from './subjectText.js';
import { verbFinalCluster } from './verbFinalCluster.js';
import { verbGroup } from './verbGroup.js';

/**
 * A restrictive relative clause on `np`, German-style: comma, relative pronoun agreeing
 * with the head in gender/number and case, then the clause with its finite verb pushed to
 * the end. A subject-relative uses a nominative pronoun and the head drives agreement
 * ("der Junge, der weint"). A direct-object relative uses an accusative pronoun, renders
 * the clause's own subject, and that subject drives agreement ("das Buch, das ich lese").
 * A head filling a complement takes that complement's preposition and case ("das Haus, in dem der
 * Kater isst", "der Junge, dem der Mann das Buch gibt"), see `relativePronoun`. A possessor gap is
 * the genitive "dessen"/"deren", agreeing with the head, followed by the phrase it owns without an
 * article of its own ("ein Satzgefüge, dessen Nomen ein Wort ist"). A passive builds its verb complex
 * on "werden", as the main clause does, and its agent gap is "von" + the dative pronoun ("das Kind, von
 * dem das Buch geschrieben wird"). Returns "" if `np` has no relative. The clause is bracketed by commas at both ends; a closing comma that lands
 * against the sentence-final stop (or another comma) is tidied up in `punctuate`.
 */
export function subordinateClause(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  const f = np.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  // Nominative for a subject-relative and for a predicate noun ("der Held, der er wird"), accusative
  // for a direct-object relative. A head filling any other complement takes that complement's
  // preposition and case ("in dem", "mit denen", the bare dative "dem", "durch dessen Schuld").
  // A head gapped as the object of a verb that takes it with a preposition keeps that preposition, as a
  // complement's does: "die Taste, auf die der Kater klickt" (A139).
  const gap = relativeGapComplement(np, { definiteness: 'relative' });
  // A genitive relative gaps no slot: the head owns the clause's subject, which follows the
  // "dessen"/"deren" article-less, in the nominative its slot takes. It is already inside the
  // pronoun, so the clause does not write it again as a subject.
  const possessed = relativePossessed(rel);
  const headPrep = rel.headRole === 'directObject' ? objectPreposition(rel.verbPhrase.verb) : '';
  // The gap's preposition can be the verb's own — ADD's goal takes "zu", not the default "in" (A143)
  // — so the clause's verb forms reach the stand-in too, not only the rendered complements below.
  const pronoun = possessed
    ? [relativePronoun(f, 'gen', plural), subjectText(possessed)].filter(Boolean).join(' ')
    : rel.headRole === 'agent'
      ? `von ${relativePronoun(f, 'dat', plural)}`
    : gap
      ? complementsPhrase(gap, rel.verbPhrase.verb.forms)
      : [headPrep, relativePronoun(f, subjectRelative || rel.headRole === 'predicative' ? 'nom' : headPrep ? objectPrepCase(headPrep) : 'acc', plural)].filter(Boolean).join(' ');
  // Agreement + the rendered clause subject: the head fills it for a subject-relative;
  // otherwise the clause carries its own nominative subject.
  const agreeForms = subjectRelative ? f : rel.subject!.agreement;
  const clauseSubjectText = subjectRelative || possessed ? '' : subjectText(rel.subject!);

  const { verb, modifier, tense = 'present', aspect = 'neutral', mood, modals } = rel.verbPhrase;
  const person = agreeForms['person'] ?? '3';
  const aPlural = (agreeForms['number'] ?? agreeForms['count']) === 'plural';
  const pn = `${person}${aPlural ? 'pl' : 'sg'}`;
  // The verb complex is built by the same `verbGroup`/`modalVerbGroup` the main clause uses, so a
  // relative clause renders its aspect too (resultative "gegessen hat", progressive "gerade isst",
  // prospective "im Begriff zu essen ist"). The clause is verb-final: the finite verb (`v2`) closes
  // it, sitting after the non-finite `tail` (Partizip / infinitive / the modal stack) unless that is a
  // double infinitive ("der das Buch wird essen müssen", see `verbFinalCluster`), while the aspect
  // adverbial (`mid`: "gerade") sits in the Mittelfeld before the objects — the mirror of the main
  // clause, whose finite verb leads from the V2 slot instead.
  // A reflexive verb builds its forms as the plain verb, its pronoun leading the Mittelfeld's pronoun
  // slot: "der sich bewegt", "die sich bewegt haben" (see `reflexivePronoun`).
  // A passive conjugates "werden" with the lexical verb's Partizip II at the head of the clause-final
  // material, and is never reflexive (see `renderClause`): "das gegessen wird", "das gegessen worden ist".
  const passive = rel.verbPhrase.voice === 'passive' && !!rel.verbPhrase.passiveAux;
  const plain = passive ? rel.verbPhrase.passiveAux!.forms : nonReflexiveVerb(verb).forms;
  const built = modals.length > 0
    ? modalVerbGroup(modals, plain, pn, tense, aspect, mood)
    : verbGroup(plain, pn, tense, aspect, mood);
  const complex = passive ? passiveComplex(built, verb.forms['participle'] ?? verb.forms['base'] ?? '') : built;
  const { mid } = complex;

  // The dative recipient leads the accusative object, and a subordinate means clause trails the
  // finite verb, as in the main clause (see `splitMeansClause`): "der isst, indem er ein Wort wählt".
  // Negation follows the main clause's rules (see `finiteNegation`): "der keine Maus isst", "der nie
  // isst", "der nicht immer isst", "der nicht müde wird", "der nicht im Begriff zu essen ist".
  // An object a preposition leads stands where a predicate complement does, after "nicht" (A139),
  // and so does a prepositional complement: "der nicht zum Markt geht" (A159). The main clause
  // computes the same flag in `renderClause`; this is the second site.
  const objectPrep = objectPreposition(verb);
  const leadsComplements = !!rel.complements?.['predicative'] || hasPrepositionalComplement(rel.complements)
    || (!!objectPrep && !!rel.directObject);
  // In a SUBJECT relative the head noun stands in for the subject, but a `kein` head negates the
  // MATRIX clause, not this one ("kein Kater, der nicht frisst, läuft"), so it never counts. Any other
  // relative renders its own subject, and that subject's `kein` is this clause's negator, as in the
  // main clause (A160, A166): "die Maus, die kein Kater frisst", "in dem kein Kater läuft". A genitive
  // relative's subject is the possessed phrase inside the pronoun, article-less, so it never counts
  // (see `relativeSubjectIsNegative`).
  const { nicht, directObject, complements: negComplements } = finiteNegation({
    subjectIsNegative: relativeSubjectIsNegative(rel),
    verbPhrase: rel.verbPhrase, directObject: rel.directObject, complements: rel.complements,
  }, leadsComplements);
  const { dative, rest: undative } = splitDative(negComplements, verb.forms);
  const { means, rest } = splitMeansClause(undative);
  const dativeText = complementsPhrase(dative, verb.forms);
  // The means clause's subject is the pronoun of whoever does the act (B06, see `meansDoer`): the
  // clause's agreeing subject, which is the head itself in a subject relative ("der Hund, der
  // frisst, indem er ein Wort wählt"), or under the passive its agent, which a relative gapped on
  // the agent has in the head; an agentless passive names no one ("…, indem man …").
  const doer = passive ? (rel.headRole === 'agent' ? f : rel.agent?.agreement) : agreeForms;
  const meansText = meansClause(means, doer);
  // A passive has no accusative object left, so its by-phrase takes the noun object's slot, as in the
  // main clause: "das vom Kind im Haus geschrieben wird".
  const { pronoun: objectPronoun, noun: objectNoun, prepositional } = splitObject(directObject, '', objectPrep);
  const directObjectText = passive ? agentPhrase(rel.agent) : objectNoun;
  const objectPronounText = [passive ? '' : reflexivePronoun(verb.forms, pn), objectPronoun].filter(Boolean).join(' ');
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const modalAdverbsText = modalAdverbs(modals);
  // The adverbs already follow the objects here, so a direction adverb only has to leave the
  // prospective group's pre-object slot (see `adverbSlots`).
  const adverb = adverbSlots(modifier, nicht, modalAdverbsText);
  const complementsText = complementsWithNicht([prepositional], rest, verb.forms, nicht.beforeComplements);

  // The adverbs follow the objects ("der das Buch immer liest") but lead the other complements,
  // so a predicate complement stays against the verb ("der immer müde wird"). An object pronoun leads
  // even "gerade" ("der ihn gerade sieht"), and the prospective's zu-infinitive group (see `splitObject`).
  // A frequency adverb scopes over the whole prospective, not over the zu-infinitive alone — "war
  // NIE im Begriff zu lieben", where "im Begriff, nie zu lieben" says the opposite (A146). Under a
  // modal it stays in the group: German "muss nie" means "need never", a separate judgement.
  const prospectiveFrequency = isFrequencyAdverb(modifier) && modals.length === 0 ? modifierText : '';
  const predicate = complex.zuInfinitive
    ? prospectiveFrame(complex, {
      nicht: nicht.beforeAspect, modalAdverbs: modalAdverbsText, frequencyAdverb: prospectiveFrequency,
      pronoun: objectPronounText,
      adverb: prospectiveFrequency ? '' : adverb.beforeObject, dative: dativeText, directObject: directObjectText,
      directionAdverb: adverb.afterObject, complements: complementsText,
    }, true)
    : [objectPronounText, mid, dativeText, directObjectText, nicht.beforeAdverb, modalAdverbsText, modifierText, complementsText, nicht.after, ...verbFinalCluster(complex)];
  const body = [pronoun, clauseSubjectText, ...predicate, meansText]
    .filter(Boolean)
    .join(' ');
  return `, ${body},`;
}
