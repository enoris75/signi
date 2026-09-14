import type { NounPhrase, PhrasePlan, Possessor } from "@signi/shared";
import { isPronominalPossessor, nounConjuncts } from "@signi/shared";
import type { NounAddress, NounKey } from "../../interfaces.ts";
import { getTopElement } from "./getTopElement.ts";

// Resolve a noun address to its noun phrase in `plan`. The first segment names a top-level
// noun — the *head* of its slot, i.e. the first conjunct when the slot is coordinated — and
// each trailing step descends: `possessor` into that noun's possessor, `conjunct/<i>` into the
// i-th extra conjunct of the slot (both already built by buildNounElement). Returns undefined
// if any step is absent.
export function getNoun(plan: Partial<PhrasePlan>, address: NounAddress): NounPhrase | undefined {
  const [base, ...steps] = address.split("/");
  const element = getTopElement(plan, base as NounKey);
  if (!element) return undefined;
  const conjuncts = nounConjuncts(element);
  let np: NounPhrase | undefined = conjuncts[0];
  for (let i = 0; i < steps.length; i++) {
    if (!np) return undefined;
    if (steps[i] === "possessor") {
      // A pronominal possessor ("his") is not a real noun phrase, so it cannot be a
      // relative-clause endpoint — descending into it yields nothing.
      const p: Possessor | undefined = np.possessor;
      np = p && !isPronominalPossessor(p) ? p : undefined;
    } else if (steps[i] === "conjunct") {
      // `conjunct/<i>` addresses the i-th *extra* conjunct, so it is offset by one past the head.
      const index = Number(steps[++i]);
      if (!Number.isInteger(index)) return undefined;
      np = conjuncts[index + 1];
    } else {
      return undefined;
    }
  }
  return np;
}
