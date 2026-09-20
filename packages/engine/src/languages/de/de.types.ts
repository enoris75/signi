import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement } from '../../types.js';

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
 *
 * `finiteLeadsTail` marks a double infinitive: a modal's infinitive stacked under werden/würde. A
 * verb-final clause then puts the finite auxiliary ahead of the infinitive cluster instead of after
 * it ("der das Buch wird essen müssen"), see `verbFinalCluster`. It is absent everywhere else.
 *
 * `particle` is a separable verb's particle when `v2` is that verb's own finite form (A138): a V2
 * clause leaves it at the very end ("fügt die Maus nicht hinzu"), a verb-final one joins it back onto
 * the finite verb ("die Maus hinzufügt"). It is absent when the verb is non-finite, where the particle
 * stays on the infinitive and the participle ("wird hinzufügen", "hat hinzugefügt").
 */
export interface VerbComplex {
  v2: string;
  mid: string;
  tail: string;
  zuInfinitive: string;
  finiteLeadsTail?: true;
  particle?: string;
}

/**
 * The Mittelfeld slots a negating "nicht" may take (see `nichtSlots`): before the prospective's "im
 * Begriff", before a Mittelfeld adverb, before the complements, or after the objects. Each holds
 * "nicht" or "", and at most one holds it.
 */
export interface NichtSlots {
  beforeAspect: string;
  beforeAdverb: string;
  beforeComplements: string;
  after: string;
}

/**
 * How a finite clause negates (see `finiteNegation`): the "nicht" slots, and the direct object and
 * complements to render, whose "kein" a negator standing ahead of them turns into the plain
 * indefinite ("isst nie eine Maus", "kein Kater läuft in einem Haus").
 */
export interface FiniteNegation {
  nicht: NichtSlots;
  directObject?: ResolvedNounElement;
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
}
