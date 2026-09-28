/**
 * The Lithuanian cases (P18 §0.2): the six the corpus stores for every noun, and the vocative an address
 * reads (`voc_sg`). Forked from `pl/pl.types.ts` (P18 D9); language folders never share one.
 */
export type Case = 'nom' | 'gen' | 'dat' | 'acc' | 'ins' | 'loc' | 'voc';

/**
 * Lithuanian nouns are masculine or feminine (P18 §0.2). `neut` is no noun's gender: it is what a
 * predicate adjective agrees with when its subject has none (an infinitive or a clause: *valgyti
 * gera*), and it reads the adjective's stored `neuter`.
 */
export type Gender = 'masc' | 'fem' | 'neut';

/**
 * What a declined word agrees with: the head noun's gender and number. Lithuanian has no
 * masculine-personal class and no animate accusative (P18 "Why"), so nothing else.
 */
export interface Agr {
  gender: Gender;
  plural: boolean;
}

/**
 * What a finite verb and the participles of its group agree with: the subject's person and number,
 * and its gender for the participles (*yra suvalgęs / suvalgiusi*, *yra suvalgyta*). The finite verb
 * itself never agrees in gender, and its 3rd person is one form for both numbers (P18 §2.2).
 */
export interface VerbAgr {
  person: '1' | '2' | '3';
  plural: boolean;
  gender: Gender;
}

/**
 * An adposition and the case it governs (P18 §2.3). An empty `prep` is a bare case (*namuose*,
 * *vaikui*, *peiliu*); `post` puts it after its noun, the one postposition *dėka* (*draugo dėka*).
 */
export interface Government {
  prep: string;
  case: Case;
  post?: boolean;
}

/** What a clause hands down to the noun phrases in it (see `nounPhrase`). */
export interface NpContext {
  /**
   * The clause's subject agreement, for a possessor that refers back to it: *savo* (P18 §0.4).
   * Absent in the subject itself and outside a clause.
   */
  subject?: Record<string, string>;
}
