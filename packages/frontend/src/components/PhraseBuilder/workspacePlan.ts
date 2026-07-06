import type { ComplementType, NounPhrase, PhrasePlan, RelativeClause } from "@signi/shared";
import { COMPLEMENT_TYPES } from "@signi/shared";
import { NounKey, PhraseContainer, PhraseLink } from "./interfaces.ts";
import { selectionToPlan } from "./selectionToPlan.ts";

const CORE_KEYS = new Set<NounKey>(["subject", "directObject", "indirectObject"]);
const COMPLEMENT_KEYS = new Set<string>(COMPLEMENT_TYPES);

// Read the noun phrase filling a container plan's slot. Core roles (subject/objects) sit
// at the top level; complement nouns live under `complements[type].phrase`.
function getNoun(plan: Partial<PhrasePlan>, key: NounKey): NounPhrase | undefined {
  if (CORE_KEYS.has(key)) return plan[key as "subject" | "directObject" | "indirectObject"];
  return plan.complements?.[key as ComplementType]?.phrase;
}

// A container is a root iff no link targets it — those translate as their own sentence.
function isRoot(container: PhraseContainer, links: PhraseLink[]): boolean {
  return !links.some((l) => l.target.containerId === container.id);
}

// Attach each cross-container relative clause sourced from `container` onto the matching
// noun phrase in `plan`. Recurses through the target containers, which become relative
// clauses; `seen` guards against cycles (links are meant to form a forest).
function attachLinks(
  plan: Partial<PhrasePlan>,
  container: PhraseContainer,
  links: PhraseLink[],
  byId: Map<string, PhraseContainer>,
  seen: Set<string>,
): void {
  for (const link of links) {
    if (link.source.containerId !== container.id) continue;
    const target = byId.get(link.target.containerId);
    if (!target || seen.has(target.id)) continue;
    const head = getNoun(plan, link.source.nounKey);
    if (!head) continue;
    head.relative = buildRelativeClause(target, link.target.nounKey, links, byId, seen);
  }
}

// Serialise a target container as a relative clause whose head fills the `gap` slot. The
// gap slot is dropped (its surface comes from the head above); any other slot is kept. A
// non-subject relative keeps the clause's own subject, which drives agreement.
function buildRelativeClause(
  container: PhraseContainer,
  gap: NounKey,
  links: PhraseLink[],
  byId: Map<string, PhraseContainer>,
  seen: Set<string>,
): RelativeClause {
  const plan = selectionToPlan(container.selection);
  attachLinks(plan, container, links, byId, new Set([...seen, container.id]));
  const complements = plan.complements ? { ...plan.complements } : undefined;
  if (complements && COMPLEMENT_KEYS.has(gap)) delete complements[gap as ComplementType];
  return {
    headRole: gap,
    // The head fills the gap, so it is omitted; a non-subject relative keeps its own subject.
    subject: gap === "subject" ? undefined : plan.subject,
    verbPhrase: plan.verbPhrase!,
    directObject: gap === "directObject" ? undefined : plan.directObject,
    indirectObject: gap === "indirectObject" ? undefined : plan.indirectObject,
    complements: complements && Object.keys(complements).length > 0 ? complements : undefined,
  };
}

// One serialized sentence: the plan plus the id of its root container (used as a React key
// and to label "Sentence N").
export interface WorkspaceSentence {
  containerId: string;
  plan: Partial<PhrasePlan>;
}

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
      return { containerId: c.id, plan };
    });
}
