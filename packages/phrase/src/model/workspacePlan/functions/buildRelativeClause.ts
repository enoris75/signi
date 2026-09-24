import type { ComplementType, RelativeClause } from "@signi/shared";
import type { NounKey, PhraseContainer, PhraseLink } from "../../interfaces.ts";
import { selectionToPlan } from "../../selectionToPlan/index.ts";
import { COMPLEMENT_KEYS } from "../workspacePlan.consts.ts";
import { attachLinks } from "./attachLinks.ts";
import { hasHead } from "./hasHead.ts";

// Serialise a target container as a relative clause whose head fills the `gap` slot. The
// gap slot is dropped (its surface comes from the head above); any other slot is kept. A
// non-subject relative keeps the clause's own subject, which drives agreement. A complement gap
// keeps its specifiers, which pick the relativizer's preposition ("the house under which …").
// A period with no verb yet is no clause at all: it yields nothing rather than a relative clause
// without its predicate, which the engine cannot render. Nor does a non-subject gap whose period's
// subject box is still empty: the engine refuses it, since it would read as a subject relative, the
// head turned into the one who acts (A275). A subject relative needs none: the head is its subject.
export function buildRelativeClause(
  container: PhraseContainer,
  gap: NounKey,
  links: PhraseLink[],
  byId: Map<string, PhraseContainer>,
  seen: Set<string>,
): RelativeClause | undefined {
  const plan = selectionToPlan(container.selection);
  if (!plan.verbPhrase) return undefined;
  if (gap !== "subject" && !hasHead(plan.subject)) return undefined;
  attachLinks(plan, container, links, byId, new Set([...seen, container.id]));
  const complements = plan.complements ? { ...plan.complements } : undefined;
  const headSpecifiers = COMPLEMENT_KEYS.has(gap) ? complements?.[gap as ComplementType]?.specifiers : undefined;
  if (complements && COMPLEMENT_KEYS.has(gap)) delete complements[gap as ComplementType];
  return {
    headRole: gap,
    ...(headSpecifiers?.length ? { headSpecifiers } : {}),
    // The head fills the gap, so it is omitted; a non-subject relative keeps its own subject.
    subject: gap === "subject" ? undefined : plan.subject,
    verbPhrase: plan.verbPhrase,
    directObject: gap === "directObject" ? undefined : plan.directObject,
    complements: complements && Object.keys(complements).length > 0 ? complements : undefined,
  };
}
