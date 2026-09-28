/**
 * The Polish cases (P05 §0.2): the six the corpus stores for every noun, and the vocative an address
 * reads (`voc_sg`). German's `de.types.ts` is the model; language folders never share one.
 */
export type Case = 'nom' | 'gen' | 'dat' | 'acc' | 'ins' | 'loc' | 'voc';

export type Gender = 'masc' | 'fem' | 'neut';

/**
 * What a declined word agrees with: the head noun's gender and number, whether its plural is
 * masculine-personal (*virile*: *dobrzy chłopcy*, accusative = genitive *dobrych chłopców*), and
 * whether a masculine singular takes the animate accusative (= genitive: *dobrego psa*).
 */
export interface Agr {
  gender: Gender;
  plural: boolean;
  virile: boolean;
  animate: boolean;
}

/**
 * What a finite verb agrees with: the subject's person, number and gender, and whether a plural is
 * virile (*zjedli* against *zjadły*). A quantified subject (*wiele kotów*) is 3rd singular neuter.
 */
export interface VerbAgr {
  person: '1' | '2' | '3';
  plural: boolean;
  gender: Gender;
  virile: boolean;
}

/** A preposition and the case it governs (P05 §2.3). An empty `prep` is a bare case. */
export interface Government {
  prep: string;
  case: Case;
}

/** What a clause hands down to the noun phrases in it (see `nounPhrase`). */
export interface NpContext {
  /**
   * The clause's subject agreement, for a possessor that refers back to it: *swój* (P05 §0.5).
   * Absent in the subject itself and outside a clause.
   */
  subject?: Record<string, string>;
  /** The phrase stands after a preposition: a 3rd-person pronoun takes its *n*-form (*do niego*). */
  afterPrep?: boolean;
  /** A personal pronoun object takes its clitic where it has one (*widzi go*, *daje mu*). */
  short?: boolean;
}
