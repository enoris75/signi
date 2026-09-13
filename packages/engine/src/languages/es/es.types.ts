/** A noun phrase's adjectives, agreed with the head and split around it. */
export interface EsAdjectives {
  /** The prenominal ones, in order, ready to sit between the article and the noun. */
  pre: string;
  /** The postnominal ones, coordinated with y/e. */
  post: string;
}
