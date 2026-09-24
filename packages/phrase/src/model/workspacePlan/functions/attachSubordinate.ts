import type { ContentClause, InfinitiveComplement, NounElement, NounPhrase, PhrasePlan } from "@signi/shared";
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
  const nonfinite = link.kind === "infinitive" || link.kind === "purpose";
  const clausePlan = selectionToPlan(nonfinite ? { ...clause.selection, infinitive: true } : clause.selection);
  if (!clausePlan.verbPhrase) return;
  // A finite clause (a that-clause, an adverbial one) says its own subject, and the engine cannot
  // render one without: until its subject box holds a word it contributes nothing either, as the
  // panel translates a period only once its subject has a head (see useTranslation). An infinitive's
  // subject is the governing clause's and goes unsaid, so it needs none.
  if (!nonfinite && !hasHead(clausePlan.subject)) return;
  attachLinks(clausePlan, clause, links, byId, new Set([...seen, clause.id]));
  if (link.kind === "purpose") {
    const { verbPhrase, directObject, complements } = clausePlan;
    plan.purpose = {
      verbPhrase: verbPhrase!,
      // "…to load **it**": a third-person pronoun object stands for the governing clause's object, and
      // is given it as its antecedent, which each language takes its gender from (P13).
      ...(directObject ? { directObject: withAntecedent(directObject, plan.directObject) } : {}),
      ...(complements ? { complements } : {}),
    };
  } else if (link.kind === "infinitive") {
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

// A purpose clause's third-person pronoun object, given the governing clause's object as what it
// stands for (P13) — "to write content to load it", where "it" is the content.
function withAntecedent(object: NounElement, governing: NounElement | undefined): NounElement {
  const np = object as NounPhrase;
  const head = governing && !("conjuncts" in governing) ? governing.concept : undefined;
  if ("conjuncts" in object || np.concept !== "THIRD_PERSON" || np.antecedent || !head) return object;
  // The antecedent's word gives the pronoun its gender in each language, as the gender chip cannot.
  const { gender: _gender, ...rest } = np;
  return { ...rest, antecedent: head };
}
