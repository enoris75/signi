import type { Concept, Degree, NounModifier, PronominalPossessor } from "@signi/shared";

/**
 * A noun block's adjective slots split by the picked concept's role: real adjectives, each with
 * its degree (index-aligned), and nouns used attributively.
 */
export interface NounModifiers {
  adjectives: string[];
  adjectiveDegrees: Degree[];
  nounModifiers: NounModifier[];
}

/** The noun a pronominal possessor points at, and the features the possessive pronoun agrees with. */
export interface Antecedent {
  concept: Concept;
  features: PronominalPossessor;
}
