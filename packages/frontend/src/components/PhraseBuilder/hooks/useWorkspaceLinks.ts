import React, { useEffect, useState } from "react";
import {
  AbstractionLevel,
  CoordConjunction,
  NounAddress,
  NounKey,
  PhraseContainer,
  PhraseLink,
  PickMode,
  WorkspaceBinding,
  imperativePerson,
  imperativeRegisterOf,
  isConditionalLink,
  isCoordinativeLink,
  isInstrumentalLink,
  isRelativeLink,
} from "../interfaces.ts";
import {
  addConditional,
  addCoordinative,
  addInstrumental,
  addRelativeLink,
  canBeCondition as conditionAllowed,
  canBeCoordinate as coordinateAllowed,
  canBeInstrument as instrumentAllowed,
  canBeRelativeTarget,
  clearConditional as withoutConditional,
  clearCoordinative as withoutCoordinative,
  clearInstrumental as withoutInstrumental,
  dropContainerLinks,
  removeRelativeLink,
  setInstrumentalLevel as withInstrumentalLevel,
  setInstrumentalNegative as withInstrumentalNegative,
} from "../linkRules.ts";

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
 * pick, which is transient. The rules themselves are pure (see linkRules), so the console's link
 * commands accept exactly the links a pick does. It hands back the per-container compartments the binding needs, so
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
    setLinks((ls) => dropContainerLinks(ls, id));
    if (pick.active && pick.source.containerId === id) cancelPick();
  }

  // ── Relative (noun-to-noun) linking ────────────────────────────────────────
  function startLink(containerId: string, nounKey: NounAddress) {
    setPick({ active: true, kind: "relative", source: { containerId, nounKey } });
  }

  function removeLink(containerId: string, nounKey: NounAddress) {
    setLinks((ls) => removeRelativeLink(ls, containerId, nounKey));
  }

  function completeLink(targetContainerId: string, targetNoun: NounKey) {
    if (!pick.active || pick.kind !== "relative") return;
    const source = pick.source;
    cancelPick();
    const target = { containerId: targetContainerId, nounKey: targetNoun };
    if (!canBeRelativeTarget(containers, links, source.containerId, target)) return;
    setLinks((ls) => addRelativeLink(ls, source, target, uid()));
  }

  // ── Conditional (container-to-container) linking ───────────────────────────
  function startConditional(containerId: string) {
    setPick({ active: true, kind: "conditional", source: { containerId } });
  }

  function clearConditional(mainContainerId: string) {
    setLinks((ls) => withoutConditional(ls, mainContainerId));
  }

  const canBeCondition = (mainId: string, ifId: string) => conditionAllowed(links, mainId, ifId);

  function completeConditional(ifContainerId: string) {
    if (!pick.active || pick.kind !== "conditional") return;
    const mainId = pick.source.containerId;
    cancelPick();
    if (!canBeCondition(mainId, ifContainerId)) return;
    setLinks((ls) => addConditional(ls, mainId, ifContainerId, uid()));
  }

  // ── Coordinative (container-to-container) linking ──────────────────────────
  function startCoordinative(containerId: string, conjunction: CoordConjunction) {
    setPick({ active: true, kind: "coordinative", conjunction, source: { containerId } });
  }

  function clearCoordinative(firstContainerId: string) {
    setLinks((ls) => withoutCoordinative(ls, firstContainerId));
  }

  const canBeCoordinate = (firstId: string, secondId: string) =>
    coordinateAllowed(containers, links, firstId, secondId);

  function completeCoordinative(secondContainerId: string) {
    if (!pick.active || pick.kind !== "coordinative") return;
    const firstId = pick.source.containerId;
    const conjunction = pick.conjunction;
    cancelPick();
    if (!canBeCoordinate(firstId, secondContainerId)) return;
    setLinks((ls) => addCoordinative(ls, firstId, secondContainerId, conjunction, uid()));
  }

  // ── Instrumental (verb box → instrument period) linking ────────────────────
  function startInstrumental(containerId: string) {
    setPick({ active: true, kind: "instrumental", source: { containerId } });
  }

  // Set the reification degree of the instrumental link this container takes part in — from
  // either end, since the control rides the instrument period but the link is the pair's.
  function setInstrumentalLevel(containerId: string, level: AbstractionLevel) {
    setLinks((ls) => withInstrumentalLevel(ls, containerId, level));
  }

  // Deny the instrument, or take the denial back (the privative, P09-E2) — from either end too.
  function setInstrumentalNegative(containerId: string, negative: boolean) {
    setLinks((ls) => withInstrumentalNegative(ls, containerId, negative));
  }

  function clearInstrumental(containerId: string) {
    setLinks((ls) => withoutInstrumental(ls, containerId));
  }

  // A pick always makes an object-level link: the plain "with a word" the period already holds.
  // Raising it to an act is a deliberate move.
  const canBeInstrument = (clauseId: string, instrumentId: string) =>
    instrumentAllowed(containers, links, clauseId, instrumentId);

  function completeInstrumental(instrumentContainerId: string) {
    if (!pick.active || pick.kind !== "instrumental") return;
    const clauseId = pick.source.containerId;
    cancelPick();
    if (!canBeInstrument(clauseId, instrumentContainerId)) return;
    setLinks((ls) => addInstrumental(ls, clauseId, instrumentContainerId, uid()));
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
          canBeRelativeTarget(containers, links, pick.source.containerId, {
            containerId: c.id,
            nounKey: nounKey as NounKey,
          }),
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
        negative: instLink?.negative === true,
        onNegativeChange: (negative) => setInstrumentalNegative(c.id, negative),
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
