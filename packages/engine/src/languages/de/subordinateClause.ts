import { relativeGapComplement, type ResolvedNounPhrase } from '../../types.js';
import { complementsPhrase } from './complementsPhrase.js';
import { elementPhrase } from './elementPhrase.js';
import { finiteNegation } from './finiteNegation.js';
import { modalAdverbs } from './modalAdverbs.js';
import { modalVerbGroup } from './modalVerbGroup.js';
import { prospectiveFrame } from './prospectiveFrame.js';
import { relativePronoun } from './relativePronoun.js';
import { splitDative } from './splitDative.js';
import { splitMeansClause } from './splitMeansClause.js';
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
 * Kater isst", "der Junge, dem der Mann das Buch gibt"), see `relativePronoun`. Returns "" if `np`
 * has no relative. The clause is bracketed by commas at both ends; a closing comma that lands
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
  const gap = relativeGapComplement(np, { definiteness: 'relative' });
  const pronoun = gap
    ? complementsPhrase(gap)
    : relativePronoun(f, subjectRelative || rel.headRole === 'predicative' ? 'nom' : 'acc', plural);
  // Agreement + the rendered clause subject: the head fills it for a subject-relative;
  // otherwise the clause carries its own nominative subject.
  const agreeForms = subjectRelative ? f : rel.subject!.agreement;
  const clauseSubjectText = subjectRelative ? '' : subjectText(rel.subject!);

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
  const complex = modals.length > 0
    ? modalVerbGroup(modals, verb.forms, pn, tense, aspect, mood)
    : verbGroup(verb.forms, pn, tense, aspect, mood);
  const { mid } = complex;

  // The dative recipient leads the accusative object, and a subordinate means clause trails the
  // finite verb, as in the main clause (see `splitMeansClause`): "der isst, indem man ein Wort wählt".
  const { dative, rest: undative } = splitDative(rel.complements);
  const { means, rest } = splitMeansClause(undative);
  const dativeText = complementsPhrase(dative);
  const meansText = complementsPhrase(means);
  // Negation follows the main clause's rules (see `finiteNegation`): "der keine Maus isst", "der nie
  // isst", "der nicht immer isst", "der nicht müde wird", "der nicht im Begriff zu essen ist".
  const { nicht, directObject } = finiteNegation(rel.verbPhrase, rel.directObject, !!rel.complements?.['predicative']);
  const directObjectText = directObject ? elementPhrase(directObject, 'acc') : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const modalAdverbsText = modalAdverbs(modals);
  const complementsText = complementsPhrase(rest, verb.forms);

  // The adverbs follow the objects ("der das Buch immer liest") but lead the other complements,
  // so a predicate complement stays against the verb ("der immer müde wird").
  const predicate = complex.zuInfinitive
    ? prospectiveFrame(complex, {
      nicht: nicht.beforeAspect, modalAdverbs: modalAdverbsText,
      adverb: modifierText, dative: dativeText, directObject: directObjectText, complements: complementsText,
    }, true)
    : [mid, dativeText, directObjectText, nicht.beforeAdverb, modalAdverbsText, modifierText, nicht.beforePredicative, complementsText, nicht.after, ...verbFinalCluster(complex)];
  const body = [pronoun, clauseSubjectText, ...predicate, meansText]
    .filter(Boolean)
    .join(' ');
  return `, ${body},`;
}
