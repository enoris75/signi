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
