import type { ResolvedNounElement } from '../../types.js';

/** A German grammatical case. */
export type Case = 'nom' | 'acc' | 'dat' | 'gen';

/** A declension-table column: the singular genders, plus the plural (which neutralises gender). */
export type Slot = 'masc' | 'fem' | 'neut' | 'plural';

/** An imperative person-number key: du (2sg), the wir cohortative (1pl), ihr (2pl). */
export type DeIPN = '2sg' | '1pl' | '2pl';

/**
 * The German verb complex split across the clause (see `verbGroup` / `modalVerbGroup`): `v2` is the
 * finite verb in the V2 slot, `mid` any Mittelfeld material that follows it ("gerade", "im Begriff"),
 * and `tail` the clause-final non-finite material (infinitive, Partizip II, the prospective's "sein",
 * the modal stack). `zuInfinitive` is the prospective's "zu essen", which heads a group of its own
 * rather than closing the clause (see `prospectiveFrame`); it is "" for every other aspect.
 */
export interface VerbComplex {
  v2: string;
  mid: string;
  tail: string;
  zuInfinitive: string;
}

/**
 * The Mittelfeld slots a negating "nicht" may take (see `nichtSlots`): before the prospective's "im
 * Begriff", before a Mittelfeld adverb, before a predicate complement, or after the objects and
 * complements. Each holds "nicht" or "", and at most one holds it.
 */
export interface NichtSlots {
  beforeAspect: string;
  beforeAdverb: string;
  beforePredicative: string;
  after: string;
}

/**
 * How a finite clause negates (see `finiteNegation`): the "nicht" slots, and the direct object to
 * render, which a negative adverb turns from "kein" into the plain indefinite.
 */
export interface FiniteNegation {
  nicht: NichtSlots;
  directObject?: ResolvedNounElement;
}
