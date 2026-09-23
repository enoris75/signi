import type { ComplementType, PhrasePlan } from "@signi/shared";
import type { PhraseSelection } from "../../interfaces.ts";
import { askedRole, questionAnimateOf } from "../../functions/questionGates.ts";

/**
 * Turn a period's plan into its wh-question (P09-E12 M6): name the gap, and leave the gapped slot's
 * word out of the plan, as a relative clause leaves out its head's. Only a sentence's own top clause
 * asks one — a coordinated clause is a yes/no question beside it, and a clause in a condition, a
 * relative clause or an instrument asks nothing — so this runs on the root period's plan alone (see
 * workspaceToPlans), after its links are attached. Nothing happens where the engine would refuse the
 * gap (see `askedRole`).
 *
 * A subject gap still carries a subject, which the plan type requires: the throwaway GENERIC_PERSON
 * the engine's own tests use, never rendered — the verb agrees with the question word ("who eats").
 * A complement gap keeps its relation (`questionSpecifiers`), which is how the engine tells *where*
 * from "under what".
 */
export function askQuestion(plan: Partial<PhrasePlan>, sel: PhraseSelection): void {
  const role = askedRole(sel);
  // The engine asks nothing under a condition (the main clause is in the conditional mood), so a
  // period that has one keeps its words.
  if (!role || plan.condition) return;
  // A that-clause the period governs is its verb's object (see attachSubordinate), so the object is
  // no gap: "what does the man say that the cat runs?" asks nothing a period can hold.
  if (role === "directObject" && plan.contentObject) return;
  if (role === "subject") plan.subject = { concept: "GENERIC_PERSON" };
  else if (role === "directObject") delete plan.directObject;
  else {
    const complements = { ...plan.complements };
    const specifiers = complements[role as ComplementType]?.specifiers;
    delete complements[role as ComplementType];
    if (Object.keys(complements).length > 0) plan.complements = complements;
    else delete plan.complements;
    if (specifiers?.length) plan.questionSpecifiers = specifiers;
  }
  plan.questionRole = role;
  if (questionAnimateOf(sel, role)) plan.questionAnimate = true;
}
