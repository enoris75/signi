import type { AbstractionLevel, CoordConjunction } from "@signi/shared";
import {
  isConditionalLink,
  isCoordinativeLink,
  isInstrumentalLink,
  isRelativeLink,
  type NounAddress,
  type NounKey,
  type PhraseContainer,
  type PhraseLink,
  type PhraseSelection,
} from "./interfaces.ts";

/**
 * The rules of the workspace's link graph, as pure functions of the containers and the links.
 *
 * Four relations join periods — a relative clause, an if-condition, a coordination and an
 * instrument — and every one is made the same way on the canvas: a pick starts from one period and
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
      ((isConditionalLink(l) || isCoordinativeLink(l)) &&
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
  target: { containerId: string; nounKey: NounKey },
): boolean {
  if (sourceContainerId === target.containerId) return false;
  const c = containers.find((x) => x.id === target.containerId);
  if (!c || !c.selection[target.nounKey as keyof PhraseSelection]) return false;
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
  target: { containerId: string; nounKey: NounKey },
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
 */
export function canStartCondition(links: PhraseLink[], c: PhraseContainer): boolean {
  return (
    !c.selection.imperative &&
    !c.selection.infinitive &&
    !links.some((l) => isConditionalLink(l) && l.target.containerId === c.id) &&
    !links.some((l) => isCoordinativeLink(l) && (l.source.containerId === c.id || l.target.containerId === c.id))
  );
}

// Whether `ifId` may become the "if" clause of `mainId`: not itself, no cycle, and free of any
// other clause-level relation.
export function canBeCondition(links: PhraseLink[], mainId: string, ifId: string): boolean {
  if (mainId === ifId) return false;
  if (isSelfOrAncestor(ifId, mainId, links)) return false;
  return !inClauseRelation(links, ifId);
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
    !links.some((l) => isConditionalLink(l) && (l.source.containerId === c.id || l.target.containerId === c.id))
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
  return Boolean(first.selection.imperative) === Boolean(second.selection.imperative);
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
