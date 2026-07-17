import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Concept, PronominalPossessor } from "@signi/shared";
import { NounAddress, PhraseSelection } from "./interfaces.ts";
import { resolveAntecedent } from "./selectionToPlan.ts";

// Coordinating the "pinpoint a noun" gesture for a *pronominal* possessor ("the boy and his
// horse"). The possessor control lives on a noun that may be nested (a coordinated conjunct's
// possessor), while its antecedent is another noun anywhere in the same period — so the pick can
// only be arbitrated at the period root, which owns the whole selection tree. This context is
// provided there and consumed by every descendant noun box (to highlight/accept a click) and by
// the possessor panels (to start a pick, and to describe the antecedent already chosen).

export interface CorefPick {
  // The address of the noun whose possessor is currently being pinpointed, or null when idle.
  picking: NounAddress | null;
  // Begin a pick for `possessed`; `commit` stores the chosen antecedent address on that noun.
  start: (possessed: NounAddress, commit: (antecedent: NounAddress) => void) => void;
  cancel: () => void;
  // Is `candidate` a legal antecedent for the noun currently being pinpointed? (Not itself, and
  // not a noun inside its own possessor/conjunct subtree — a thing cannot be owned via its own part.)
  isEligible: (candidate: NounAddress) => boolean;
  // Accept `candidate` as the antecedent (commits + ends the pick).
  pick: (candidate: NounAddress) => void;
  // Resolve an antecedent address against the period's selection, for display ("refers to the
  // boy") and for the possessive-pronoun hint. Null when the address no longer resolves.
  resolve: (address: NounAddress) => { concept: Concept; features: PronominalPossessor } | undefined;
}

export const CorefPickContext = createContext<CorefPick | null>(null);

/** The coref-pick coordinator, if one is in scope. Null only outside any period builder. */
export function useCorefPick(): CorefPick | null {
  return useContext(CorefPickContext);
}

/**
 * Build a coref-pick coordinator that reads antecedents off `rootSelection` (the whole period
 * selection). The outermost period builder owns one of these and re-provides it via
 * `CorefPickContext`; nested conjunct / possessor builders inherit the parent's instead (so one
 * pick spans the whole tree), and simply ignore the value this returns.
 */
export function useProvideCorefPick(rootSelection: PhraseSelection): CorefPick {
  const [state, setState] = useState<{
    possessed: NounAddress;
    commit: (antecedent: NounAddress) => void;
  } | null>(null);

  const start = useCallback(
    (possessed: NounAddress, commit: (antecedent: NounAddress) => void) =>
      setState({ possessed, commit }),
    [],
  );
  const cancel = useCallback(() => setState(null), []);

  const isEligible = useCallback(
    (candidate: NounAddress) =>
      !!state &&
      candidate !== state.possessed &&
      // Exclude the possessed's own subtree — a noun cannot be owned by one of its own parts.
      !candidate.startsWith(`${state.possessed}/`),
    [state],
  );

  const pick = useCallback((candidate: NounAddress) => {
    setState((s) => {
      if (s) s.commit(candidate);
      return null;
    });
  }, []);

  const resolve = useCallback(
    (address: NounAddress) => resolveAntecedent(rootSelection, address),
    [rootSelection],
  );

  return useMemo<CorefPick>(
    () => ({ picking: state?.possessed ?? null, start, cancel, isEligible, pick, resolve }),
    [state, start, cancel, isEligible, pick, resolve],
  );
}

// A short English possessive-pronoun hint for the chosen antecedent ("his", "their"), shown beside
// the reference chip so the user sees what the link will render — the same features every engine
// spells its own way. English only; a display aid, not the rendered output.
const EN_POSSESSIVE: Record<string, string> = {
  "1sg": "my",
  "2sg": "your",
  "3sg": "his",
  "1pl": "our",
  "2pl": "your",
  "3pl": "their",
};

export function possessiveHintEn(features: PronominalPossessor): string {
  const key = `${features.person}${features.number === "plural" ? "pl" : "sg"}`;
  if (key === "3sg") {
    return features.gender === "fem" ? "her" : features.gender === "neut" ? "its" : "his";
  }
  return EN_POSSESSIVE[key] ?? "their";
}
