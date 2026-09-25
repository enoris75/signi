import type { PhraseContainer, PhraseLink } from "../../interfaces.ts";
import { askQuestion, selectionToPlan } from "../../selectionToPlan/index.ts";
import type { WorkspaceSentence } from "../workspacePlan.types.ts";
import { attachCondition } from "./attachCondition.ts";
import { attachCoordination } from "./attachCoordination.ts";
import { attachInstrumental } from "./attachInstrumental.ts";
import { attachLinks } from "./attachLinks.ts";
import { attachSubordinate } from "./attachSubordinate.ts";
import { isRoot } from "./isRoot.ts";

// Serialise the whole workspace: one PhrasePlan per root container, each with its linked
// containers folded in as relative clauses on the appropriate noun phrases.
export function workspaceToPlans(
  containers: PhraseContainer[],
  links: PhraseLink[],
): WorkspaceSentence[] {
  const byId = new Map(containers.map((c) => [c.id, c]));
  return containers
    .filter((c) => isRoot(c, links))
    .map((c) => {
      const plan = selectionToPlan(c.selection);
      attachLinks(plan, c, links, byId, new Set([c.id]));
      attachInstrumental(plan, c, links, byId, new Set([c.id]));
      attachCondition(plan, c, links, byId, new Set([c.id]));
      attachCoordination(plan, c, links, byId, new Set([c.id]));
      attachSubordinate(plan, c, links, byId, new Set([c.id]));
      // A wh-question's gap is the top clause's own: the linked clauses above ask nothing of their own.
      askQuestion(plan, c.selection);
      // So is the interjection (P09-E47): set here, on the root alone, so a that-clause — which carries
      // its target's whole plan — never takes one along; and not under the infinitive, whose citation
      // calls no one ("Hey, to run." reads wrong in all seven).
      if (c.selection.interjection && !c.selection.infinitive) plan.interjection = c.selection.interjection.id;
      return { containerId: c.id, plan };
    });
}
