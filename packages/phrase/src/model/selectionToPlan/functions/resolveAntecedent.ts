import type { Concept } from "@signi/shared";
import type { NounAddress, PhraseSelection } from "../../interfaces.ts";
import type { Antecedent } from "../selectionToPlan.types.ts";
import { field } from "./field.ts";

// Resolve a *pronominal* possessor reference into concrete features. `address` points at an
// antecedent noun elsewhere in the same period (`root`); we navigate to it — mirroring `getNoun`
// in workspacePlan, but over the selection so we can read the Concept's own person — and read off
// the person/number/gender the possessive pronoun agrees with. A pronoun antecedent supplies its
// own person/number; a noun is 3rd person, singular unless the user set it plural. The gender is
// the antecedent's grammatical-gender pick (drives en his/her/its, de sein/ihr). Returns undefined
// if the address no longer resolves (the antecedent was deleted), so the possessor just drops.
export function resolveAntecedent(
  root: PhraseSelection,
  address: NounAddress,
): Antecedent | undefined {
  const [base, ...steps] = address.split("/");
  let sel: PhraseSelection = root;
  let key = base;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i] === "possessor") {
      const child = field<PhraseSelection>(sel, `${key}Possessor`);
      if (!child) return undefined;
      sel = child;
      key = "subject";
    } else if (steps[i] === "conjunct") {
      const idx = Number(steps[++i]);
      const child = field<PhraseSelection[]>(sel, `${key}Conjuncts`)?.[idx];
      if (!child) return undefined;
      sel = child;
      key = "subject";
    } else if (steps[i] === "standard") {
      const child = field<PhraseSelection>(sel, `${key}Standard`);
      if (!child) return undefined;
      sel = child;
      key = "subject";
    } else if (steps[i] === "examples") {
      const child = field<PhraseSelection>(sel, `${key}Examples`);
      if (!child) return undefined;
      sel = child;
      key = "subject";
    } else {
      return undefined;
    }
  }
  const concept = field<Concept>(sel, key);
  if (!concept) return undefined;
  const person = (concept.person ?? "3") as "1" | "2" | "3";
  const number = field<"singular" | "plural">(sel, `${key}Number`) ?? concept.number ?? "singular";
  const gender = field<"masc" | "fem" | "neut">(sel, `${key}Gender`);
  return { concept, features: { kind: "pronominal", person, number, ...(gender && { gender }) } };
}
