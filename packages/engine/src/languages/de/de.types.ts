/** A German grammatical case. */
export type Case = 'nom' | 'acc' | 'dat' | 'gen';

/** A declension-table column: the singular genders, plus the plural (which neutralises gender). */
export type Slot = 'masc' | 'fem' | 'neut' | 'plural';

/** An imperative person-number key: du (2sg), the wir cohortative (1pl), ihr (2pl). */
export type DeIPN = '2sg' | '1pl' | '2pl';

/**
 * The German verb complex split across the clause (see `verbGroup` / `modalVerbGroup`): `v2` is the
 * finite verb in the V2 slot, `mid` any Mittelfeld material that follows it ("gerade", "im Begriff"),
 * and `tail` the clause-final non-finite material (infinitive, Partizip II, "zu …", the modal stack).
 */
export interface VerbComplex {
  v2: string;
  mid: string;
  tail: string;
}
