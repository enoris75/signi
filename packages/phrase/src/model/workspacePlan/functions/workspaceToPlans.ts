import type { PhraseContainer, PhraseLink } from "../../interfaces.ts";
import { askQuestion, selectionToPlan } from "../../selectionToPlan/index.ts";
import { buildNounElement } from "../../selectionToPlan/functions/buildNounElement.ts";
import { CONJUNCTS_KEY, type PhraseSelection } from "../../interfaces.ts";
import { VOCATIVE_PRONOUNS } from "../../slots.ts";
import { vocativeOffered } from "../../functions/vocativeOffered.ts";
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
      // The vocative (P11-E8), the root's alone, before its relative clauses are attached to it.
      const address = vocativeOf(c.selection);
      if (address) plan.address = address;
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

/**
 * The root period's vocative, "**Mom**, run" (P11-E8): its noun element, where the period says one
 * (see vocativeOffered) — set here, on the root alone, so a that-clause, which carries its target's
 * whole plan, never takes one along. A group with a pronoun the address cannot call — a 1st or 3rd
 * person, the generic one (A338) — is left out whole, as the engine would refuse it; the canvas and
 * the console offer none, so only a hand-made selection reaches that.
 */
function vocativeOf(sel: PhraseSelection) {
  if (!sel.vocative || !vocativeOffered(sel, true)) return undefined;
  const heads = [sel.vocative, ...((sel[CONJUNCTS_KEY("vocative")] as PhraseSelection[] | undefined) ?? []).map((c) => c.subject)];
  if (heads.some((h) => h?.role === "pronoun" && !VOCATIVE_PRONOUNS.includes(h.id))) return undefined;
  return buildNounElement(sel, "vocative");
}
