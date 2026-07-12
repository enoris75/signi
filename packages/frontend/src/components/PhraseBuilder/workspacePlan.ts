import type { ComplementType, NounPhrase, PhrasePlan, RelativeClause } from "@signi/shared";
import { COMPLEMENT_TYPES, isActionLevel } from "@signi/shared";
import { NounAddress, NounKey, PhraseContainer, PhraseLink, isConditionalLink, isCoordinativeLink, isInstrumentalLink, isRelativeLink } from "./interfaces.ts";
import { selectionToPlan } from "./selectionToPlan.ts";

const CORE_KEYS = new Set<NounKey>(["subject", "directObject"]);
const COMPLEMENT_KEYS = new Set<string>(COMPLEMENT_TYPES);

// Resolve the top-level noun phrase filling a container plan's slot. Core roles
// (subject/objects) sit at the top level; complement nouns live under `complements[type].phrase`.
function getTopNoun(plan: Partial<PhrasePlan>, key: NounKey): NounPhrase | undefined {
  if (CORE_KEYS.has(key)) return plan[key as "subject" | "directObject"];
  return plan.complements?.[key as ComplementType]?.phrase;
}

// Resolve a noun address to its noun phrase in `plan`. The first segment names a top-level
// noun; each trailing `possessor` segment descends into that noun's possessor (already built
// by buildNounPhrase). Returns undefined if any step is absent.
function getNoun(plan: Partial<PhrasePlan>, address: NounAddress): NounPhrase | undefined {
  const [base, ...steps] = address.split("/");
  let np = getTopNoun(plan, base as NounKey);
  for (const step of steps) {
    if (!np || step !== "possessor") return undefined;
    np = np.possessor;
  }
  return np;
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
    if (!isRelativeLink(link)) continue;
    if (link.source.containerId !== container.id) continue;
    const target = byId.get(link.target.containerId);
    if (!target || seen.has(target.id)) continue;
    const head = getNoun(plan, link.source.nounKey);
    if (!head) continue;
    head.relative = buildRelativeClause(target, link.target.nounKey, links, byId, seen);
  }
}

// Attach the hypothetical condition (the "if" clause) sourced from `container` onto `plan`.
// The IF container is serialised as its own plan (with its own relative links folded in) and
// hung on `plan.condition`; the translator renders it as the protasis. Conditions don't nest,
// so the IF clause is not itself given a condition.
function attachCondition(
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
function attachCoordination(
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
  attachLinks(clausePlan, second, links, byId, new Set([...seen, second.id]));
  plan.coordination = { conjunction: link.conjunction, clause: clausePlan as PhrasePlan };
}

// Attach the instrument sourced from `container` onto `plan` as its `instrumental` complement.
// The linked container is serialised like any other, and what is taken from it depends on the
// link's reification degree (see AbstractionLevel):
//
//  · object  — the period is a bare noun phrase, and its subject *is* the instrument:
//              "start **with a word**".
//  · process
//    concept — the period is a verb and the noun it acts on, with no subject of its own (the
//              clause above supplies it): its verb becomes the complement's `action` and its
//              direct object the noun the act is done to — "start **by choosing a word**" /
//              "**with the act of choosing a word**". The level rides along as a specifier so
//              each engine can pick its own non-finite form.
//
// Either way the instrument keeps its own relative links ("with the word that I chose"). A period
// that hasn't got what its level needs yet contributes nothing rather than half a complement — so
// an action level with no verb, or with no object for it, simply doesn't render.
function attachInstrumental(
  plan: Partial<PhrasePlan>,
  container: PhraseContainer,
  links: PhraseLink[],
  byId: Map<string, PhraseContainer>,
  seen: Set<string>,
): void {
  const link = links.find(
    (l) => isInstrumentalLink(l) && l.source.containerId === container.id,
  );
  if (!link || !isInstrumentalLink(link)) return;
  const instrument = byId.get(link.target.containerId);
  if (!instrument || seen.has(instrument.id)) return;
  const instrumentPlan = selectionToPlan(instrument.selection);
  attachLinks(instrumentPlan, instrument, links, byId, new Set([...seen, instrument.id]));

  const level = link.level ?? "object";
  const complement = isActionLevel(level)
    ? instrumentPlan.verbPhrase && instrumentPlan.directObject
      ? {
          phrase: instrumentPlan.directObject,
          action: instrumentPlan.verbPhrase,
          specifiers: [{ kind: "abstraction" as const, value: level }],
        }
      : undefined
    : instrumentPlan.subject
      ? { phrase: instrumentPlan.subject }
      : undefined;
  if (!complement) return;
  plan.complements = { ...plan.complements, instrumental: complement };
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
      attachInstrumental(plan, c, links, byId, new Set([c.id]));
      attachCondition(plan, c, links, byId, new Set([c.id]));
      attachCoordination(plan, c, links, byId, new Set([c.id]));
      return { containerId: c.id, plan };
    });
}
