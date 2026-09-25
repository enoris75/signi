/** A noun phrase's adjectives, agreed with the head and split around it. */
export interface PtAdjectives {
  /** The prenominal ones, in order, ready to sit between the article and the noun. */
  pre: string;
  /** The postnominal ones, coordinated with "e". */
  post: string;
  /**
   * The postnominal ones when they follow a genitive possessor instead of the noun, because one of them
   * carries an attributive standard or set the possessor would otherwise be read into (A372, see
   * `possessorBeforeStandard`); `post` is then empty. `withRelative` writes them after the possessor.
   */
  trail?: string;
}
