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
