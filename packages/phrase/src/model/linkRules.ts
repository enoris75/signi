import type { AbstractionLevel, CoordConjunction, SubordinatingConjunction } from "@signi/shared";
import {
  type RelativeGap,
  isConditionalLink,
  isCoordinativeLink,
  isInstrumentalLink,
  isRelativeLink,
  isSubordinateLink,
  type NounAddress,
  type PhraseContainer,
  type PhraseLink,
  type PhraseSelection,
  type SubordinateKind,
} from "./interfaces.ts";

/**
 * The rules of the workspace's link graph, as pure functions of the containers and the links.
 *
 * Five relations join periods — a relative clause, an if-condition, a coordination, a subordinate
 * clause and an instrument — and every one is made the same way on the canvas: a pick starts from one period and
 * lands on another. What a pick may land on, and what the link it makes replaces, is stated here
 * once, so the canvas's picks (useWorkspaceLinks) and the console's commands (console/language)
 * accept exactly the same links: no cycles, one subordinate role per period, and the mood rules.
 */

// Is `candidate` the container `of`, or an ancestor of it (walking up incoming links)?
// Used to reject links that would form a cycle — links are meant to form a forest.
export function isSelfOrAncestor(
  candidate: string,
  of: string,
  links: PhraseLink[],
): boolean {
  let cur: string | undefined = of;
  const seen = new Set<string>();
  while (cur) {
    if (cur === candidate) return true;
    if (seen.has(cur)) break;
    seen.add(cur);
    cur = links.find((l) => l.target.containerId === cur)?.source.containerId;
  }
  return false;
}

// Whether `id` is already spoken for as the *subordinate* end of a relation — an "if" clause, a
// coordinated clause, an instrument phrase or a relative clause's gap — or the source of one of the
// two clause-level ones. Such a container can't be pulled into a second relation: a period plays
// one subordinate role. (A relative link, made second, already takes the period from whatever held
// it — see addRelativeLink; this is the same rule the other way round.)
//
// The one endpoint left free is the *source* of an instrumental: that container is still an
// ordinary clause of its own, so it may go on to take a condition or a coordinate.
export function inClauseRelation(links: PhraseLink[], id: string): boolean {
  return links.some(
    (l) =>
      ((isConditionalLink(l) || isCoordinativeLink(l) || isSubordinateLink(l)) &&
        (l.source.containerId === id || l.target.containerId === id)) ||
      ((isInstrumentalLink(l) || isRelativeLink(l)) && l.target.containerId === id),
  );
}

/** Drop every link touching a container that was removed or cleared (its targets re-become roots). */
export function dropContainerLinks(links: PhraseLink[], id: string): PhraseLink[] {
  return links.filter((l) => l.source.containerId !== id && l.target.containerId !== id);
}

// ── Relative (noun-to-noun) ──────────────────────────────────────────────────

/** The nouns of a container that a relative link already targets. */
export function relativeTargetKeys(links: PhraseLink[], containerId: string): Set<NounAddress> {
  return new Set(
    links
      .filter(isRelativeLink)
      .filter((l) => l.target.containerId === containerId)
      .map((l) => l.target.nounKey),
  );
}

/**
 * Whether the noun `targetNoun` of `target` may become the gap of a relative clause headed by a noun
 * of `sourceContainerId`: another period, not an ancestor of the source (no cycle), a noun that holds
 * a word, and not already the gap of another clause.
 */
export function canBeRelativeTarget(
  containers: PhraseContainer[],
  links: PhraseLink[],
  sourceContainerId: string,
  target: { containerId: string; nounKey: RelativeGap },
): boolean {
  if (sourceContainerId === target.containerId) return false;
  const c = containers.find((x) => x.id === target.containerId);
  if (!c) return false;
  // The instrument (P13): a gap of a verb that takes one and has none linked — the head is it.
  if (target.nounKey === "instrumental") {
    if (!c.selection.verb?.complements?.includes("instrumental")) return false;
    if (links.some((l) => isInstrumentalLink(l) && l.source.containerId === c.id)) return false;
  } else if (target.nounKey === "subject/possessor") {
    // The subject's possessor (P13): the genitive relative, whose head owns the subject.
    if (!c.selection.subjectPossessor?.subject) return false;
  } else if (!c.selection[target.nounKey as keyof PhraseSelection]) return false;
  if (relativeTargetKeys(links, target.containerId).has(target.nounKey)) return false;
  return !isSelfOrAncestor(target.containerId, sourceContainerId, links);
}

/**
 * Link the noun at `source` to the gap `target`. One relative link per source noun, and one incoming
 * link per target container: a container can't be both a clause-level linked clause and a
 * relativised gap, so whatever else targeted it goes.
 */
export function addRelativeLink(
  links: PhraseLink[],
  source: { containerId: string; nounKey: NounAddress },
  target: { containerId: string; nounKey: RelativeGap },
  id: string,
): PhraseLink[] {
  const kept = links.filter((l) =>
    isRelativeLink(l)
      ? !(l.source.containerId === source.containerId && l.source.nounKey === source.nounKey) &&
        l.target.containerId !== target.containerId
      : l.target.containerId !== target.containerId,
  );
  return [...kept, { id, source, target }];
}

// Say the relative clause headed by the noun at `nounKey` alone, its head unspoken (P13), or say the
// head again. The flag is dropped rather than set false, so a headed link is the link it always was.
export function setRelativeHeadless(
  links: PhraseLink[],
  containerId: string,
  nounKey: NounAddress,
  headless: boolean,
): PhraseLink[] {
  return links.map((l) => {
    if (!isRelativeLink(l) || l.source.containerId !== containerId || l.source.nounKey !== nounKey) return l;
    const { headless: _dropped, ...rest } = l;
    return headless ? { ...rest, headless: true } : rest;
  });
}

export function removeRelativeLink(
  links: PhraseLink[],
  containerId: string,
  nounKey: NounAddress,
): PhraseLink[] {
  return links.filter(
    (l) =>
      !(isRelativeLink(l) && l.source.containerId === containerId && l.source.nounKey === nounKey),
  );
}

// ── Conditional (container-to-container) ────────────────────────────────────

/**
 * Whether a period may *start* a condition. An IF clause can't also be a main clause (conditionals
 * don't chain), and a period in a coordination — or acting as a command or an infinitive citation —
 * can't take one either (a citation is a leaf; a command is a mood incompatible with a conditional).
 * Nor can a question: the engine asks nothing in the conditional mood a main clause takes (P09-E12).
 */
export function canStartCondition(links: PhraseLink[], c: PhraseContainer): boolean {
  return (
    !c.selection.imperative &&
    !c.selection.infinitive &&
    !c.selection.interrogative &&
    !links.some((l) => isConditionalLink(l) && l.target.containerId === c.id) &&
    !links.some((l) => isCoordinativeLink(l) && (l.source.containerId === c.id || l.target.containerId === c.id)) &&
    !links.some((l) => isSubordinateLink(l) && l.target.containerId === c.id)
  );
}

// Whether `ifId` may become the "if" clause of `mainId`: not itself, no cycle, free of any other
// clause-level relation, and not a question. The engine renders an if-clause in its own mood and asks
// nothing there, so a question would lose its force while its control stayed lit (A268), as
// `canBeSubordinate` and `canStartCondition` refuse one for the same reason.
export function canBeCondition(
  containers: PhraseContainer[],
  links: PhraseLink[],
  mainId: string,
  ifId: string,
): boolean {
  if (mainId === ifId) return false;
  if (isSelfOrAncestor(ifId, mainId, links)) return false;
  if (inClauseRelation(links, ifId)) return false;
  const clause = containers.find((c) => c.id === ifId);
  if (!clause) return false;
  return !clause.selection.interrogative && !clause.selection.questionRole;
}

/** One "if" clause per main clause: the one it had is replaced. */
export function addConditional(
  links: PhraseLink[],
  mainId: string,
  ifId: string,
  id: string,
): PhraseLink[] {
  return [
    ...clearConditional(links, mainId),
    { id, kind: "conditional", source: { containerId: mainId }, target: { containerId: ifId } },
  ];
}

export function clearConditional(links: PhraseLink[], mainId: string): PhraseLink[] {
  return links.filter((l) => !(isConditionalLink(l) && l.source.containerId === mainId));
}

// ── Coordinative (container-to-container) ───────────────────────────────────

/**
 * Whether a period may *start* a coordination: not a second clause already, and not tied into a
 * conditional. A command may coordinate — with a second command (see canBeCoordinate). An infinitive
 * citation is a leaf and does not coordinate.
 */
export function canStartCoordination(links: PhraseLink[], c: PhraseContainer): boolean {
  return (
    !c.selection.infinitive &&
    !links.some((l) => isCoordinativeLink(l) && l.target.containerId === c.id) &&
    !links.some((l) => isConditionalLink(l) && (l.source.containerId === c.id || l.target.containerId === c.id)) &&
    !links.some((l) => isSubordinateLink(l) && l.target.containerId === c.id)
  );
}

// Whether `secondId` may become the coordinated second clause of `firstId`: not itself, no cycle,
// free of any other clause-level relation, and — because coordination is a symmetric join — of the
// same mood as the first clause. A command coordinates with a command ("eat the bread, then run!")
// and a statement with a statement; the two moods don't mix, so a period must be marked a command
// itself before it can be coordinated with one.
export function canBeCoordinate(
  containers: PhraseContainer[],
  links: PhraseLink[],
  firstId: string,
  secondId: string,
): boolean {
  if (firstId === secondId) return false;
  if (isSelfOrAncestor(secondId, firstId, links)) return false;
  if (inClauseRelation(links, secondId)) return false;
  const first = containers.find((c) => c.id === firstId);
  const second = containers.find((c) => c.id === secondId);
  if (!first || !second) return false;
  // A question coordinates with a question ("does the cat eat, and does the dog run?"), for the
  // same reason: the pair shares one force (P09-E12).
  return (
    Boolean(first.selection.imperative) === Boolean(second.selection.imperative) &&
    Boolean(first.selection.interrogative) === Boolean(second.selection.interrogative)
  );
}

/** One coordination per first clause: the one it had is replaced. */
export function addCoordinative(
  links: PhraseLink[],
  firstId: string,
  secondId: string,
  conjunction: CoordConjunction,
  id: string,
): PhraseLink[] {
  return [
    ...clearCoordinative(links, firstId),
    {
      id,
      kind: "coordinative",
      conjunction,
      source: { containerId: firstId },
      target: { containerId: secondId },
    },
  ];
}

export function clearCoordinative(links: PhraseLink[], firstId: string): PhraseLink[] {
  return links.filter((l) => !(isCoordinativeLink(l) && l.source.containerId === firstId));
}

// ── Subordinate (container-to-container, P09-E12 D9) ────────────────────────

/**
 * Whether a period may *govern* a subordinate clause of `kind`. It needs a verb — an object clause
 * is governed by one, and an adverbial clause modifies one — and it must be a clause of its own,
 * the target of no link: a subordinate clause does not nest, and an if-clause, a coordinate or a
 * relative clause is folded into its host with no room for one. Beyond that:
 *  - `content` — the verb takes a that-clause (`clauseObject: 'content'`) and holds no direct
 *    object, since the clause *is* its object;
 *  - `infinitive` — the verb takes an infinitive complement (`clauseObject: 'infinitive'`);
 *  - `adverbial` — any verb: nothing licenses an adjunct.
 * With no `kind`, whether it may govern any of the three (what the border control asks).
 */
export function canStartSubordinate(links: PhraseLink[], c: PhraseContainer, kind?: SubordinateKind): boolean {
  const verb = c.selection.verb;
  if (!verb || links.some((l) => l.target.containerId === c.id)) return false;
  if (kind === "content") return verb.clauseObject === "content" && !c.selection.directObject;
  if (kind === "infinitive") return verb.clauseObject === "infinitive";
  return true;
}

/**
 * Whether `clauseId` may become the subordinate clause of `mainId`: not itself, no cycle, free of any
 * other clause-level relation, and a *plain* clause — no condition, coordination or instrument of its
 * own, and no mood — a command, a citation or a question (P09-E12 D9: the engine's clause has no
 * field for any of them). It may keep its relative clauses. The one mood allowed is the infinitive, on an infinitive link, which draws its
 * clause in that mood anyway.
 */
export function canBeSubordinate(
  containers: PhraseContainer[],
  links: PhraseLink[],
  mainId: string,
  clauseId: string,
  kind: SubordinateKind,
): boolean {
  if (mainId === clauseId) return false;
  if (isSelfOrAncestor(clauseId, mainId, links)) return false;
  if (inClauseRelation(links, clauseId)) return false;
  if (links.some((l) => isInstrumentalLink(l) && l.source.containerId === clauseId)) return false;
  const clause = containers.find((c) => c.id === clauseId);
  if (!clause) return false;
  const sel = clause.selection;
  // Nor a question (P09-E12 M5): a content clause keeps a statement's order whatever hosts it, so the
  // engine would render a question's words inside it ("says that does the cat run"). The clause that
  // governs it may be one ("does the man say that the cat runs?").
  if (sel.interrogative || sel.questionRole) return false;
  return !sel.imperative && (kind === "infinitive" || !sel.infinitive);
}

/** One subordinate clause per governing clause: the one it had, of whatever kind, is replaced. */
export function addSubordinate(
  links: PhraseLink[],
  mainId: string,
  clauseId: string,
  kind: SubordinateKind,
  id: string,
  conjunction: SubordinatingConjunction = "when",
): PhraseLink[] {
  const source = { containerId: mainId };
  const target = { containerId: clauseId };
  const link: PhraseLink =
    kind === "adverbial"
      ? { id, kind, conjunction, source, target }
      : { id, kind, source, target };
  return [...clearSubordinate(links, mainId), link];
}

// Make the object of the clause governing an infinitive that infinitive's subject — the causee of a
// causative (P13) — or give it back to the clause's subject. From either end of the link, as the
// instrument's privative is. The flag is dropped rather than set false.
export function setInfinitiveControl(links: PhraseLink[], containerId: string, object: boolean): PhraseLink[] {
  return links.map((l) => {
    if (!isSubordinateLink(l) || l.kind !== "infinitive") return l;
    if (l.source.containerId !== containerId && l.target.containerId !== containerId) return l;
    const { control: _dropped, ...rest } = l;
    return object ? { ...rest, control: "object" as const } : rest;
  });
}

/** Drop the subordinate clause `mainId` governs — of `kind` only, when one is given. */
export function clearSubordinate(links: PhraseLink[], mainId: string, kind?: SubordinateKind): PhraseLink[] {
  return links.filter(
    (l) => !(isSubordinateLink(l) && l.source.containerId === mainId && (!kind || l.kind === kind)),
  );
}

// ── Instrumental (verb box → instrument period) ─────────────────────────────

// Whether `instrumentId` may become the instrument phrase of `clauseId`. Same rules as the
// clause-level relations — not itself, no cycle, and free of any other container-level link — plus
// one of its own: at the `object` level the instrument is a noun phrase, so the period holding it
// must not have a verb. (An empty period qualifies: the user links it, then fills it.) A pick always
// makes an `object`-level link; raising it to an act and then giving the act its verb is what makes
// the other levels, so a link made *at* one of those may already hold that verb.
export function canBeInstrument(
  containers: PhraseContainer[],
  links: PhraseLink[],
  clauseId: string,
  instrumentId: string,
  level: AbstractionLevel = "object",
): boolean {
  if (clauseId === instrumentId) return false;
  if (isSelfOrAncestor(instrumentId, clauseId, links)) return false;
  // A clause whose instrument is a relative clause's gap has it already: the head (P13).
  if (links.some((l) => isRelativeLink(l) && l.target.containerId === clauseId && l.target.nounKey === "instrumental")) return false;
  if (inClauseRelation(links, instrumentId)) return false;
  const instrument = containers.find((c) => c.id === instrumentId);
  return Boolean(instrument) && (level !== "object" || !instrument!.selection.verb);
}

/** One instrument per clause: the one it had is replaced. */
export function addInstrumental(
  links: PhraseLink[],
  clauseId: string,
  instrumentId: string,
  id: string,
  level: AbstractionLevel = "object",
): PhraseLink[] {
  return [
    ...clearInstrumental(links, clauseId),
    {
      id,
      kind: "instrumental",
      level,
      source: { containerId: clauseId },
      target: { containerId: instrumentId },
    },
  ];
}

// Deny the instrument of the link a container takes part in, or take the denial back — the
// privative, "cuts without the knife" (P09-E2). From either end, as the level. The flag is dropped
// rather than set false, so a positive link is the link it always was.
export function setInstrumentalNegative(
  links: PhraseLink[],
  containerId: string,
  negative: boolean,
): PhraseLink[] {
  return links.map((l) => {
    if (!isInstrumentalLink(l) || (l.source.containerId !== containerId && l.target.containerId !== containerId)) return l;
    const { negative: _dropped, ...rest } = l;
    return negative ? { ...rest, negative: true } : rest;
  });
}

export function clearInstrumental(links: PhraseLink[], clauseId: string): PhraseLink[] {
  return links.filter((l) => !(isInstrumentalLink(l) && l.source.containerId === clauseId));
}

// Set the reification degree of the instrumental link a container takes part in — from either end,
// since the control rides the instrument period but the link is the pair's.
export function setInstrumentalLevel(
  links: PhraseLink[],
  containerId: string,
  level: AbstractionLevel,
): PhraseLink[] {
  return links.map((l) =>
    isInstrumentalLink(l) &&
    (l.source.containerId === containerId || l.target.containerId === containerId)
      ? { ...l, level }
      : l,
  );
}
