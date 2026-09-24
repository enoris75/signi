import type { ContentClause, InfinitiveComplement, PhrasePlan } from "@signi/shared";
import { isSubordinateLink, type PhraseContainer, type PhraseLink } from "../../interfaces.ts";
import { selectionToPlan } from "../../selectionToPlan/index.ts";
import { attachLinks } from "./attachLinks.ts";
import { hasHead } from "./hasHead.ts";

// Attach the subordinate clause sourced from `container` onto `plan` (P09-E12 D9). The linked
// container is serialised as its own plan, with its own relative links folded in, and hung where its
// link kind says:
//
//  · content    — `plan.contentObject`, the verb's object clause ("says **that the cat runs**"). The
//                 clause *is* the object, so a direct object the period still holds gives way to it.
//  · adverbial  — `plan.adverbialClause`, with the link's conjunction ("runs **when the cat eats**").
//  · infinitive — `plan.infinitiveComplement`, its verb phrase, object and complements, since its
//                 subject is the governing clause's and goes unsaid ("needs **to run**"). The period
//                 is drawn in the infinitive mood while linked, and read in it here whatever it holds.
//
// A clause has a verb, and a finite one a subject: a linked period without them yet contributes
// nothing, rather than half a clause. Subordinate clauses do not nest, so the clause is given no condition, coordination or
// clause of its own — it has no field for any of them.
export function attachSubordinate(
  plan: Partial<PhrasePlan>,
  container: PhraseContainer,
  links: PhraseLink[],
  byId: Map<string, PhraseContainer>,
  seen: Set<string>,
): void {
  const link = links.find((l) => isSubordinateLink(l) && l.source.containerId === container.id);
  if (!link || !isSubordinateLink(link)) return;
  const clause = byId.get(link.target.containerId);
  if (!clause || seen.has(clause.id)) return;
  const clausePlan = selectionToPlan(
    link.kind === "infinitive" ? { ...clause.selection, infinitive: true } : clause.selection,
  );
  if (!clausePlan.verbPhrase) return;
  // A finite clause (a that-clause, an adverbial one) says its own subject, and the engine cannot
  // render one without: until its subject box holds a word it contributes nothing either, as the
  // panel translates a period only once its subject has a head (see useTranslation). An infinitive's
  // subject is the governing clause's and goes unsaid, so it needs none.
  if (link.kind !== "infinitive" && !hasHead(clausePlan.subject)) return;
  attachLinks(clausePlan, clause, links, byId, new Set([...seen, clause.id]));
  if (link.kind === "infinitive") {
    const { verbPhrase, directObject, complements } = clausePlan;
    plan.infinitiveComplement = {
      verbPhrase,
      ...(directObject ? { directObject } : {}),
      ...(complements ? { complements } : {}),
      // The causee's infinitive (P13): its unspoken subject is the governing clause's object.
      ...(link.control === "object" ? { control: "object" as const } : {}),
    } as InfinitiveComplement;
  } else if (link.kind === "content") {
    delete plan.directObject;
    plan.contentObject = clausePlan as ContentClause;
  } else {
    plan.adverbialClause = { conjunction: link.conjunction, clause: clausePlan as ContentClause };
  }
}
