import type { PhrasePlan } from "@signi/shared";
import { isConditionalLink, type PhraseContainer, type PhraseLink } from "../../interfaces.ts";
import { selectionToPlan } from "../../selectionToPlan/index.ts";
import { attachLinks } from "./attachLinks.ts";

// Attach the hypothetical condition (the "if" clause) sourced from `container` onto `plan`.
// The IF container is serialised as its own plan (with its own relative links folded in) and
// hung on `plan.condition`; the translator renders it as the protasis. Conditions don't nest,
// so the IF clause is not itself given a condition.
export function attachCondition(
  plan: Partial<PhrasePlan>,
  container: PhraseContainer,
  links: PhraseLink[],
  byId: Map<string, PhraseContainer>,
  seen: Set<string>,
): void {
  const link = links.find(
    (l) => isConditionalLink(l) && l.source.containerId === container.id,
  );
  if (!link || !isConditionalLink(link)) return;
  const ifContainer = byId.get(link.target.containerId);
  if (!ifContainer || seen.has(ifContainer.id)) return;
  const condPlan = selectionToPlan(ifContainer.selection);
  attachLinks(condPlan, ifContainer, links, byId, new Set([...seen, ifContainer.id]));
  plan.condition = condPlan as PhrasePlan;
}
