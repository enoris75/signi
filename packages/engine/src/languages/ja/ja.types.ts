/** The form a Japanese modal suffix attaches to: the dictionary form, or the polite stem. */
export type JaForm = 'dict' | 'stem';

export type JaIPN = '2sg' | '1pl' | '2pl';

/**
 * The ending a Japanese predicate closes on: the polite main clause (食べます), the plain form a
 * prenominal relative clause needs (食べる猫), or the たら of an "if" clause (食べたら).
 */
export type JaEnding = 'polite' | 'plain' | 'tara';

/**
 * How a non-final conjunct of a coordinated predicate hands on to the next (see `predicateLinkSegs`):
 * the te-form of "and" (大きくて), the も of a negation (大きくも), or the か of "or" (大きいか).
 */
export type PredicateLink = 'te' | 'mo' | 'ka';

/**
 * The kana a verb class writes after its stem, one for each base the endings build on: `u` the
 * dictionary form (違う), `i` the continuative ます and たい attach to (違い), `a` the negative base
 * ない attaches to (違わ), and the te- and ta-forms (違って, 違った). See `jaAdjClass`'s `ru` class.
 */
export interface JaVerbRow {
  u: string;
  i: string;
  a: string;
  te: string;
  ta: string;
}
