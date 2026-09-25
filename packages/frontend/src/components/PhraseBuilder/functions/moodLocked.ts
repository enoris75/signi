import type { WorkspaceBinding } from "../interfaces.ts";

// A mood can't be flipped on a period alone while it takes part in a conditional or a coordination:
// a command is mutually exclusive with a conditional and shared by the two clauses of a
// coordination, and an infinitive occupies the finite slot the same way. A question is the pair's
// shared force too, and the conditional mood drops it (P09-E12 M5). A subordinate clause has no
// mood of its own either — an infinitive complement is drawn in the infinitive, and the others in
// none (P09-E12 D9) — so all three of its moods lock too, the question with them; the clause that
// governs it keeps its own. The relation has to be cleared first. Read by the card's border toggles
// and by the question marks on the rings (see rawSatellites).
export const moodLocked = (binding: WorkspaceBinding | undefined): boolean =>
  binding
    ? binding.conditional.hasSource ||
      binding.conditional.hasTarget ||
      binding.coordinative.hasSource ||
      binding.coordinative.hasTarget ||
      Boolean(binding.subordinate.asTarget)
    : false;

// The that-clause of a verb that reports a question (P09-E55, its `clauseForce`), in no other
// relation: its question is its own — "asks **what** the cat eats", "knows **where** the cat eats".
const reportedQuestion = (binding: WorkspaceBinding | undefined) => {
  const target = binding?.subordinate.asTarget;
  if (!binding || target?.kind !== "content" || !target.licence) return undefined;
  const related =
    binding.conditional.hasSource ||
    binding.conditional.hasTarget ||
    binding.coordinative.hasSource ||
    binding.coordinative.hasTarget;
  return related ? undefined : target.licence;
};

// The question marks on a reported question's rings are free (P09-E55 D2): its gap is its own.
export const marksLocked = (binding: WorkspaceBinding | undefined): boolean =>
  moodLocked(binding) && !reportedQuestion(binding);

// Its border's question toggle is free where the verb takes either force (KNOW whether / that), and
// locked on where it takes only a question (ASK): the command and the infinitive stay locked.
export const questionLocked = (binding: WorkspaceBinding | undefined): boolean =>
  moodLocked(binding) && reportedQuestion(binding) !== "either";

// Whether the period must stay a question (P09-E55 D3): the clause of ASK. Unmarking its gap leaves
// a yes/no question, never a statement ASK cannot report.
export const keepsQuestion = (binding: WorkspaceBinding | undefined): boolean =>
  reportedQuestion(binding) === "interrogative";
