import type { PhrasePlan } from "@signi/shared";
import type { PhraseSelection } from "../../interfaces.ts";
import { askedRole, questionAnimateOf } from "../../functions/questionGates.ts";
import { complementSpecifiers } from "./buildComplements.ts";

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
  if (role === "possessor") {
    // The owner inside the subject or the object (P09-E52 D3): the noun stays, its owner is the gap —
    // "whose food does the cat eat?". The owner's word, if the ring holds one, is not spoken, as a
    // gapped slot's is not, and *whose* is always a person, so no who / what is written.
    const possessed = sel.questionPossessed ?? "subject";
    const slot = plan[possessed];
    if (!slot || !("concept" in slot)) return;
    const { possessor: _owner, possessorRole: _role, ...noun } = slot;
    plan[possessed] = noun;
    plan.questionRole = "possessor";
    plan.questionPossessed = possessed;
    return;
  }
  if (role === "subject") plan.subject = { concept: "GENERIC_PERSON" };
  else if (role === "directObject") delete plan.directObject;
  else {
    const complements = { ...plan.complements };
    delete complements[role];
    if (Object.keys(complements).length > 0) plan.complements = complements;
    else delete plan.complements;
    // The relation is the box's, word or no word (P09-E53 D3): an asked box is usually empty.
    const specifiers = complementSpecifiers(sel, role);
    if (specifiers?.length) plan.questionSpecifiers = specifiers;
  }
  plan.questionRole = role;
  if (questionAnimateOf(sel, role)) plan.questionAnimate = true;
}
