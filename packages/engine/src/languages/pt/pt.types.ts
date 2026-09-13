/** A noun phrase's adjectives, agreed with the head and split around it. */
export interface PtAdjectives {
  /** The prenominal ones, in order, ready to sit between the article and the noun. */
  pre: string;
  /** The postnominal ones, coordinated with "e". */
  post: string;
}
