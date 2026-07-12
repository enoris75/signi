import React, { useEffect, useState } from "react";
import {
  AbstractionLevel,
  CoordConjunction,
  NounAddress,
  NounKey,
  PhraseContainer,
  PhraseLink,
  PhraseSelection,
  PickMode,
  WorkspaceBinding,
  imperativePerson,
  imperativeRegisterOf,
  isConditionalLink,
  isCoordinativeLink,
  isInstrumentalLink,
  isRelativeLink,
} from "./interfaces.ts";

/** Fresh ids for both containers and links — one source, so they never collide. */
export const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `c${Math.random().toString(36).slice(2)}`;

/** The link compartments of a container's binding — everything but `geometry`, which belongs to
 *  the connector registry (see useConnectors) rather than to the link graph. */
export type LinkCompartments = Pick<
  WorkspaceBinding,
  "relative" | "conditional" | "coordinative" | "instrumental"
>;

export interface WorkspaceLinks {
  /** The pending pick, if one is in flight (a half-built link awaiting its target). */
  pick: PickMode;
  /** Abandon it — the Escape key and the banner's Cancel button. */
  cancelPick: () => void;
  /** The four link compartments of one container's WorkspaceBinding. */
  compartmentsFor: (container: PhraseContainer) => LinkCompartments;
  /** Forget a container that was removed or cleared: drop every link touching it (its targets
   *  re-become roots) and cancel a pick sourced there. */
  dropContainer: (id: string) => void;
}

// Is `candidate` the container `of`, or an ancestor of it (walking up incoming links)?
// Used to reject links that would form a cycle — links are meant to form a forest.
function isSelfOrAncestor(
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

/**
 * The workspace's link graph: the four cross-container relations a period can take part in, and
 * the pick-mode that builds them. Each is the same three-beat gesture — start a pick from one
 * container, validate the container clicked next against the rules below, commit the link — so
 * they live together, and the rules they share (no cycles, one subordinate role per container)
 * are stated once.
 *
 *  relative     — a noun in one container is the head of the clause in another.
 *  conditional  — a clause takes another as its "if" clause.
 *  coordinative — two clauses of the same mood are joined by a conjunction.
 *  instrumental — a clause acts with the instrument a third container holds, at a chosen
 *                 reification degree (see AbstractionLevel).
 *
 * `links` is owned by the caller (it is persisted with the workspace); the hook owns only the
 * pick, which is transient. It hands back the per-container compartments the binding needs, so
 * the component that renders the stack never has to reason about the graph.
 */
export function useWorkspaceLinks(
  containers: PhraseContainer[],
  links: PhraseLink[],
  setLinks: React.Dispatch<React.SetStateAction<PhraseLink[]>>,
): WorkspaceLinks {
  const [pick, setPick] = useState<PickMode>({ active: false });

  const cancelPick = () => setPick({ active: false });

  // Cancel pick-mode on Escape.
  useEffect(() => {
    if (!pick.active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPick({ active: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pick.active]);

  function dropContainer(id: string) {
    setLinks((ls) =>
      ls.filter(
        (l) => l.source.containerId !== id && l.target.containerId !== id,
      ),
    );
    if (pick.active && pick.source.containerId === id) cancelPick();
  }

  // Whether `id` is already spoken for as the *subordinate* end of a container-level relation —
  // an "if" clause, a coordinated clause, or an instrument phrase — or the source of one of the
  // two clause-level ones. Such a container can't be pulled into a second relation.
  //
  // The one endpoint left free is the *source* of an instrumental: that container is still an
  // ordinary clause of its own, so it may go on to take a condition or a coordinate.
  function inClauseRelation(id: string): boolean {
    return links.some(
      (l) =>
        ((isConditionalLink(l) || isCoordinativeLink(l)) &&
          (l.source.containerId === id || l.target.containerId === id)) ||
        (isInstrumentalLink(l) && l.target.containerId === id),
    );
  }

  // ── Relative (noun-to-noun) linking ────────────────────────────────────────
  function startLink(containerId: string, nounKey: NounAddress) {
    setPick({ active: true, kind: "relative", source: { containerId, nounKey } });
  }

  function removeLink(containerId: string, nounKey: NounAddress) {
    setLinks((ls) =>
      ls.filter(
        (l) =>
          !(
            isRelativeLink(l) &&
            l.source.containerId === containerId &&
            l.source.nounKey === nounKey
          ),
      ),
    );
  }

  function completeLink(targetContainerId: string, targetNoun: NounKey) {
    if (!pick.active || pick.kind !== "relative") return;
    const source = pick.source;
    cancelPick();
    if (
      source.containerId === targetContainerId ||
      isSelfOrAncestor(targetContainerId, source.containerId, links)
    )
      return; // same container or would create a cycle
    setLinks((ls) => {
      const kept = ls.filter((l) =>
        isRelativeLink(l)
          ? // one relative link per source noun, and one incoming link per target container
            !(
              l.source.containerId === source.containerId &&
              l.source.nounKey === source.nounKey
            ) && l.target.containerId !== targetContainerId
          : // a container can't be both a clause-level linked clause and a relativised gap
            l.target.containerId !== targetContainerId,
      );
      return [
        ...kept,
        {
          id: uid(),
          source,
          target: { containerId: targetContainerId, nounKey: targetNoun },
        },
      ];
    });
  }

  // ── Conditional (container-to-container) linking ───────────────────────────
  function startConditional(containerId: string) {
    setPick({ active: true, kind: "conditional", source: { containerId } });
  }

  function clearConditional(mainContainerId: string) {
    setLinks((ls) =>
      ls.filter(
        (l) =>
          !(isConditionalLink(l) && l.source.containerId === mainContainerId),
      ),
    );
  }

  // Whether `ifId` may become the "if" clause of the container that started the pick: not
  // itself, no cycle, and free of any other clause-level relation.
  function canBeCondition(mainId: string, ifId: string): boolean {
    if (mainId === ifId) return false;
    if (isSelfOrAncestor(ifId, mainId, links)) return false;
    return !inClauseRelation(ifId);
  }

  function completeConditional(ifContainerId: string) {
    if (!pick.active || pick.kind !== "conditional") return;
    const mainId = pick.source.containerId;
    cancelPick();
    if (!canBeCondition(mainId, ifContainerId)) return;
    setLinks((ls) => [
      // One "if" clause per main clause: drop any conditional this main already sources.
      ...ls.filter(
        (l) => !(isConditionalLink(l) && l.source.containerId === mainId),
      ),
      {
        id: uid(),
        kind: "conditional",
        source: { containerId: mainId },
        target: { containerId: ifContainerId },
      },
    ]);
  }

  // ── Coordinative (container-to-container) linking ──────────────────────────
  function startCoordinative(containerId: string, conjunction: CoordConjunction) {
    setPick({ active: true, kind: "coordinative", conjunction, source: { containerId } });
  }

  function clearCoordinative(firstContainerId: string) {
    setLinks((ls) =>
      ls.filter(
        (l) =>
          !(isCoordinativeLink(l) && l.source.containerId === firstContainerId),
      ),
    );
  }

  // Whether `secondId` may become the coordinated second clause of the pick's first clause:
  // not itself, no cycle, free of any other clause-level relation, and — because coordination
  // is a symmetric join — of the same mood as the first clause. A command coordinates with a
  // command ("eat the bread, then run!") and a statement with a statement; the two moods don't
  // mix, so a period must be marked a command itself before it can be coordinated with one.
  function canBeCoordinate(firstId: string, secondId: string): boolean {
    if (firstId === secondId) return false;
    if (isSelfOrAncestor(secondId, firstId, links)) return false;
    if (inClauseRelation(secondId)) return false;
    const first = containers.find((c) => c.id === firstId);
    const second = containers.find((c) => c.id === secondId);
    if (!first || !second) return false;
    return Boolean(first.selection.imperative) === Boolean(second.selection.imperative);
  }

  function completeCoordinative(secondContainerId: string) {
    if (!pick.active || pick.kind !== "coordinative") return;
    const firstId = pick.source.containerId;
    const conjunction = pick.conjunction;
    cancelPick();
    if (!canBeCoordinate(firstId, secondContainerId)) return;
    setLinks((ls) => [
      // One coordination per first clause: drop any this container already sources.
      ...ls.filter(
        (l) => !(isCoordinativeLink(l) && l.source.containerId === firstId),
      ),
      {
        id: uid(),
        kind: "coordinative" as const,
        conjunction,
        source: { containerId: firstId },
        target: { containerId: secondContainerId },
      },
    ]);
  }

  // ── Instrumental (verb box → instrument period) linking ────────────────────
  function startInstrumental(containerId: string) {
    setPick({ active: true, kind: "instrumental", source: { containerId } });
  }

  // Set the reification degree of the instrumental link this container takes part in — from
  // either end, since the control rides the instrument period but the link is the pair's.
  function setInstrumentalLevel(containerId: string, level: AbstractionLevel) {
    setLinks((ls) =>
      ls.map((l) =>
        isInstrumentalLink(l) &&
        (l.source.containerId === containerId || l.target.containerId === containerId)
          ? { ...l, level }
          : l,
      ),
    );
  }

  function clearInstrumental(containerId: string) {
    setLinks((ls) =>
      ls.filter(
        (l) => !(isInstrumentalLink(l) && l.source.containerId === containerId),
      ),
    );
  }

  // Whether `instrumentId` may become the instrument phrase of the clause that started the pick.
  // Same rules as the clause-level relations — not itself, no cycle, and free of any other
  // container-level link — plus one of its own: the instrument is a noun phrase, so the period
  // holding it must not have a verb. (An empty period qualifies: the user links it, then fills it.)
  function canBeInstrument(clauseId: string, instrumentId: string): boolean {
    if (clauseId === instrumentId) return false;
    if (isSelfOrAncestor(instrumentId, clauseId, links)) return false;
    if (inClauseRelation(instrumentId)) return false;
    const instrument = containers.find((c) => c.id === instrumentId);
    return Boolean(instrument) && !instrument!.selection.verb;
  }

  function completeInstrumental(instrumentContainerId: string) {
    if (!pick.active || pick.kind !== "instrumental") return;
    const clauseId = pick.source.containerId;
    cancelPick();
    if (!canBeInstrument(clauseId, instrumentContainerId)) return;
    setLinks((ls) => [
      // One instrument per clause: drop any this container already sources.
      ...ls.filter(
        (l) => !(isInstrumentalLink(l) && l.source.containerId === clauseId),
      ),
      {
        id: uid(),
        kind: "instrumental" as const,
        // A new instrument starts at the object level — the plain "with a word" the period
        // already holds. Raising it to an act is a deliberate move.
        level: "object" as const,
        source: { containerId: clauseId },
        target: { containerId: instrumentContainerId },
      },
    ]);
  }

  // ── Per-container view of the graph ────────────────────────────────────────
  // Which relations this container already takes part in, whether it is a legal target for the
  // pick in flight, and what its controls do when clicked — the four compartments its
  // WorkspaceBinding carries.
  function compartmentsFor(c: PhraseContainer): LinkCompartments {
    const relatives = links.filter(isRelativeLink);
    const sourceKeys = new Set<NounAddress>(
      relatives
        .filter((l) => l.source.containerId === c.id)
        .map((l) => l.source.nounKey),
    );
    const targetKeys = new Set<NounAddress>(
      relatives
        .filter((l) => l.target.containerId === c.id)
        .map((l) => l.target.nounKey),
    );

    const conditionals = links.filter(isConditionalLink);
    const coordinatives = links.filter(isCoordinativeLink);
    const coordAsSource = coordinatives.find((l) => l.source.containerId === c.id);
    const coordAsTarget = coordinatives.find((l) => l.target.containerId === c.id);
    // The first clause of the coordination this period is the second clause of. When that first
    // clause is a command, the pair shares its person and register — they are one speech act —
    // and this period's own command box shows the first's, locked.
    const coordFirst = coordAsTarget
      ? containers.find((x) => x.id === coordAsTarget.source.containerId)
      : undefined;

    const instrumentals = links.filter(isInstrumentalLink);
    const instLink = instrumentals.find(
      (l) => l.source.containerId === c.id || l.target.containerId === c.id,
    );

    return {
      relative: {
        sourceKeys,
        targetKeys,
        isPickTarget: (nounKey) =>
          pick.active &&
          pick.kind === "relative" &&
          pick.source.containerId !== c.id &&
          Boolean(c.selection[nounKey as keyof PhraseSelection]) &&
          !targetKeys.has(nounKey) &&
          !isSelfOrAncestor(c.id, pick.source.containerId, links),
        // Only real top-level nouns are ever offered as pick targets, so the address is a NounKey.
        onPick: (nounKey) => completeLink(c.id, nounKey as NounKey),
        onStartLink: (nounKey) => startLink(c.id, nounKey),
        onRemoveLink: (nounKey) => removeLink(c.id, nounKey),
      },
      conditional: {
        hasSource: conditionals.some((l) => l.source.containerId === c.id),
        hasTarget: conditionals.some((l) => l.target.containerId === c.id),
        isPickTarget:
          pick.active &&
          pick.kind === "conditional" &&
          canBeCondition(pick.source.containerId, c.id),
        onStart: () => startConditional(c.id),
        onClear: () => clearConditional(c.id),
        onPick: () => completeConditional(c.id),
      },
      coordinative: {
        hasSource: Boolean(coordAsSource),
        hasTarget: Boolean(coordAsTarget),
        conjunction: (coordAsSource ?? coordAsTarget)?.conjunction,
        inheritedCommand: coordFirst?.selection.imperative
          ? {
              person: imperativePerson(coordFirst.selection),
              register: imperativeRegisterOf(coordFirst.selection),
            }
          : undefined,
        isPickTarget:
          pick.active &&
          pick.kind === "coordinative" &&
          canBeCoordinate(pick.source.containerId, c.id),
        onStart: (conjunction) => startCoordinative(c.id, conjunction),
        onClear: () => clearCoordinative(c.id),
        onPick: () => completeCoordinative(c.id),
      },
      instrumental: {
        hasSource: instrumentals.some((l) => l.source.containerId === c.id),
        hasTarget: instrumentals.some((l) => l.target.containerId === c.id),
        level: instLink?.level ?? "object",
        onLevelChange: (level) => setInstrumentalLevel(c.id, level),
        isPickTarget:
          pick.active &&
          pick.kind === "instrumental" &&
          canBeInstrument(pick.source.containerId, c.id),
        onStart: () => startInstrumental(c.id),
        onClear: () => clearInstrumental(c.id),
        onPick: () => completeInstrumental(c.id),
      },
    };
  }

  return { pick, cancelPick, compartmentsFor, dropContainer };
}
