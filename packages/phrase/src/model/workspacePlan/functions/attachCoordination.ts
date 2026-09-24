import type { PhrasePlan } from "@signi/shared";
import { isCoordinativeLink, type PhraseContainer, type PhraseLink } from "../../interfaces.ts";
import { selectionToPlan } from "../../selectionToPlan/index.ts";
import { attachInstrumental } from "./attachInstrumental.ts";
import { attachLinks } from "./attachLinks.ts";
import { hasHead } from "./hasHead.ts";

// Attach the coordinated second clause sourced from `container` onto `plan`. The coordinated
// container is serialised as its own plan (with its own relative links folded in) and hung on
// `plan.coordination`; the translator renders it after the conjunction word. Coordination
// doesn't nest, so the second clause is not itself given a coordination.
//
// Coordination is a symmetric join, so the mood belongs to the pair: the workspace only links
// two clauses of the same mood, and when they are commands the addressee and register are the
// first clause's — one command can't be spoken to "you" and its partner to "us". The second
// clause's own address selector is locked to the first's while the pair holds (see
// PhraseCanvas), so this override never contradicts what the user sees.
export function attachCoordination(
  plan: Partial<PhrasePlan>,
  container: PhraseContainer,
  links: PhraseLink[],
  byId: Map<string, PhraseContainer>,
  seen: Set<string>,
): void {
  const link = links.find(
    (l) => isCoordinativeLink(l) && l.source.containerId === container.id,
  );
  if (!link || !isCoordinativeLink(link)) return;
  const second = byId.get(link.target.containerId);
  if (!second || seen.has(second.id)) return;
  const clausePlan = selectionToPlan(
    plan.imperative
      ? {
          ...second.selection,
          imperative: true,
          imperativePerson: container.selection.imperativePerson,
          imperativeRegister: container.selection.imperativeRegister,
        }
      : second.selection,
  );
  // A statement's or a question's coordinate says its own subject, and the engine cannot render one
  // without (A267): until its subject box holds a word it contributes nothing, as a subordinate
  // clause waits (attachSubordinate). A command's coordinate has one already: `selectionToPlan` gives
  // it the addressee.
  if (!hasHead(clausePlan.subject)) return;
  attachLinks(clausePlan, second, links, byId, new Set([...seen, second.id]));
  attachInstrumental(clausePlan, second, links, byId, new Set([...seen, second.id]));
  plan.coordination = { conjunction: link.conjunction, clause: clausePlan as PhrasePlan };
}
