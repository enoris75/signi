import type { PhrasePlan } from "@signi/shared";
import { isRelativeLink, type PhraseContainer, type PhraseLink } from "../../interfaces.ts";
import { buildRelativeClause } from "./buildRelativeClause.ts";
import { getNoun } from "./getNoun.ts";

// Attach each cross-container relative clause sourced from `container` onto the matching
// noun phrase in `plan`. Recurses through the target containers, which become relative
// clauses; `seen` guards against cycles (links are meant to form a forest).
export function attachLinks(
  plan: Partial<PhrasePlan>,
  container: PhraseContainer,
  links: PhraseLink[],
  byId: Map<string, PhraseContainer>,
  seen: Set<string>,
): void {
  for (const link of links) {
    if (!isRelativeLink(link)) continue;
    if (link.source.containerId !== container.id) continue;
    const target = byId.get(link.target.containerId);
    if (!target || seen.has(target.id)) continue;
    const head = getNoun(plan, link.source.nounKey);
    if (!head) continue;
    const relative = buildRelativeClause(target, link.target.nounKey, links, byId, seen);
    if (relative) head.relative = relative;
  }
}
