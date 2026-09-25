import type { Concept, PhrasePlan, PronominalPossessor } from "@signi/shared";
import { linksToSubject } from "@signi/phrase/model/functions/linksToSubject.ts";
import type { NounAddress, PhraseSelection } from "../interfaces.ts";
import { resolveAntecedent, selectionToPlan } from "../selectionToPlan/index.ts";
import { imperativeSubject } from "../selectionToPlan/functions/imperativeSubject.ts";

/** What a pointer names on the canvas: the word its label shows, and the features its fallback chip spells. */
export type PointedAt = { concept: Concept; features: PronominalPossessor };

/**
 * The clause a link to the subject is rendered in for its chip (P11-E7 D5): the period's subject
 * as the plan says it — a group, a command's addressee, a citation's "one" — and the mood that
 * settles it. The possessed noun goes in as the direct object, and `/api/translate` hands back that
 * phrase alone, bound in the clause.
 */
export type LinkClause = Pick<PhrasePlan, "subject" | "imperative" | "imperativeRegister" | "infinitive">;

// A pronoun the period does not hold as a word — the addressee, the citation's "one" — as the label
// reads one: its person names it (see conceptWord).
const pronoun = (id: string, person: "1" | "2" | "3"): Concept => ({ id, role: "pronoun", person, description: id });

/**
 * What a pointer at `address` names on the canvas. The subject is the box's word — except where a
 * mood box stands in its place (P11-E7 D4): a command's subject is its addressee, not the word the
 * selection keeps behind it, and a citation's is "one". An infinitive or purpose clause another period
 * governs (`controlled`) has its subject in that period, which this one cannot see: nothing.
 */
export function pointedAt(root: PhraseSelection, address: NounAddress, controlled = false): PointedAt | undefined {
  if (address === "subject" && root.imperative) {
    const { concept, number = "singular" } = imperativeSubject(root.imperativePerson);
    const person = concept === "FIRST_PERSON" ? "1" : "2";
    return { concept: pronoun(concept, person), features: { kind: "pronominal", person, number } };
  }
  if (address === "subject" && root.infinitive) {
    if (controlled) return undefined;
    return { concept: pronoun("GENERIC_PERSON", "3"), features: { kind: "pronominal", person: "3", number: "singular" } };
  }
  return resolveAntecedent(root, address);
}

/**
 * The clause to render a pointer's possessed phrase in, where the pointer is the link (see
 * `linksToSubject`); undefined for a copy, which renders as a bare noun phrase, and for a controlled
 * clause, whose subject is another period's.
 */
export function linkClauseOf(
  root: PhraseSelection,
  possessed: NounAddress,
  antecedent: NounAddress,
  controlled = false,
): LinkClause | undefined {
  if (antecedent !== "subject" || controlled || !linksToSubject(root, possessed)) return undefined;
  const { subject, imperative, imperativeRegister, infinitive } = selectionToPlan(root);
  if (!subject) return undefined;
  return {
    subject,
    ...(imperative && { imperative }),
    ...(imperativeRegister && { imperativeRegister }),
    ...(infinitive && { infinitive }),
  };
}
