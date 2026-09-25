import type { Concept, PronominalPossessor } from "@signi/shared";
import type { PhraseSelection } from "../../interfaces.ts";
import { field } from "./field.ts";

/**
 * Whether a concept is one of the three persons a possessive pronoun can name (P11-E9 D2): not the
 * generic "one", and not an indefinite (SOMEONE's `slot`) — the rule the pronoun chooser's person row
 * keeps (`pronounFor`).
 */
export const isPersonalPronoun = (concept: Concept | undefined): boolean =>
  concept?.role === "pronoun" && Boolean(concept.person) && concept.id !== "GENERIC_PERSON" && !concept.slot;

/**
 * The features a possessive pronoun agrees with, read off the word in `sel`'s `key` block: its person
 * from the concept (a noun is the 3rd), its number from the block's pick, else the concept's own, and
 * its gender from the block's pick — on the 3rd person only, the one person whose possessive any of
 * the seven languages splits by gender. A gender the chooser set on a 1st or 2nd person stays in the
 * selection and is left out here (P11-E9 D3).
 *
 * One read for both ways a pronoun owner is given, so they cannot drift: a pointer at an antecedent
 * (`resolveAntecedent`) and a pronoun named in the owner's own ring (`buildNounPhrase`).
 */
export function pronounFeatures(sel: PhraseSelection, key: string, concept: Concept): PronominalPossessor {
  const person = concept.person ?? "3";
  const number = field<"singular" | "plural">(sel, `${key}Number`) ?? concept.number ?? "singular";
  const gender = person === "3" ? field<"masc" | "fem" | "neut">(sel, `${key}Gender`) : undefined;
  return { kind: "pronominal", person, number, ...(gender && { gender }) };
}
