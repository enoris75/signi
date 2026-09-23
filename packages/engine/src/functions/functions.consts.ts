import type { ComplementType } from '@signi/shared';

/**
 * Verb concept ids whose Romance `source` keeps its disambiguating ablative adverb
 * ("via da" / "loin de" / "lejos de" / "longe de") whatever the source is. These are the
 * self-propelled motion verbs where `source` (da/de) would otherwise be misread as a
 * `direction`-toward goal: "corro dal bambino" is motion TO the child, so "corro VIA dal bambino"
 * is what forces the away reading. Every other source-licensing verb drops the adverb where bare
 * da/de is already unambiguous — which is for a PLACE: COME/GO read a place source as an origin,
 * not a departure, and the transitive LOAD/IMPORT load *out of* a container ("il gatto viene dalla
 * casa", "carica il libro dal contenitore"). The adverb on those inverts the meaning ("comes/loads
 * FAR from"), so it is gated to this set.
 *
 * A PERSON or an animal is the exception, and is not handled here: the Italian animate *goal* takes
 * "da" too, so every verb needs the adverb there (A153, see `it/complementsPhrase`). `source` is
 * only licensed on these six verbs (see the intransitive corpus).
 */
export const SOURCE_ABLATIVE_ADVERB_VERBS = new Set(['RUN', 'JUMP']);

/**
 * The complements that spell a pronoun as a pronoun: every one that carries an adposition. A
 * pronoun behind one takes its tonic (disjunctive) form, no article and no declension of its own —
 * "in him", "durch ihn", "en él", "dele", "sotto di lui", "en elle" — where the ordinary
 * noun-phrase renderer would hand it a determiner and the citation form ("in the he", "durch den
 * er"). A197 gave the comitative and the instrumental this branch; A203 gave it to the other five.
 *
 * `cause` is absent because it never reaches the shared path: its connector holds a possessive in
 * the negative sentiment ("por mi culpa", "par ma faute"), so every language answers it in a branch
 * of its own, above. `predicative` and `objectPredicative` carry no adposition to govern a pronoun.
 * `temporal` is absent because a time is not a person: its adposition governs a noun phrase naming a
 * day, a week or a moment, and no pronoun stands for one.
 */
export const TONIC_COMPLEMENTS: ReadonlySet<ComplementType> = new Set<ComplementType>([
  'locative', 'terminus', 'direction', 'source', 'route', 'manner', 'comitative', 'instrumental',
  // P09-E2's two: one works *for him* and speaks *about her*, as one goes *with him*.
  'purpose', 'topic',
]);
