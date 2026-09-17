import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Concept, PronominalPossessor, UiStringKey } from "@signi/shared";
import { NounAddress, PhraseSelection } from "./interfaces.ts";
import { resolveAntecedent } from "./selectionToPlan/index.ts";

// Coordinating the "point to a noun" gesture for a *pronominal* possessor ("the boy and his
// horse"). The possessor control lives on a noun that may be nested (a conjunct's, or an owner's),
// while its antecedent is another noun anywhere in the same period — so the pick can only be
// arbitrated at the period root, which owns the whole selection tree. This context is provided
// there and consumed by every descendant noun box (to highlight/accept a click) and by the
// possessor controls (to start a pick when an owner opens, and to describe the antecedent chosen).

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

  // Commit outside the state updater: React may run an updater twice (StrictMode does), and the
  // antecedent would be stored twice.
  const pick = useCallback(
    (candidate: NounAddress) => {
      state?.commit(candidate);
      setState(null);
    },
    [state],
  );

  const resolve = useCallback(
    (address: NounAddress) => resolveAntecedent(rootSelection, address),
    [rootSelection],
  );

  return useMemo<CorefPick>(
    () => ({ picking: state?.possessed ?? null, start, cancel, isEligible, pick, resolve }),
    [state, start, cancel, isEligible, pick, resolve],
  );
}

// The possessive pronoun the chosen antecedent spells, as a UI-string key — shown on the line to it
// so the user sees what the link will render. The same features every engine spells its own way, so
// the word itself comes from the catalog (`pronoun.possessive.*`) rather than from here: this only
// says which of its cells the features land in.
//
// Third singular is the only cell any of the seven languages splits on the antecedent's *natural*
// gender (en his/her/its, de sein/ihr, ja 彼の/彼女の/それの); an antecedent with none reads as
// masculine, the unmarked one — the same fallback `possessiveEn` makes in the engine.
const POSSESSIVE_KEY = {
  "1sg": "pronoun.possessive.1sg",
  "2sg": "pronoun.possessive.2sg",
  "1pl": "pronoun.possessive.1pl",
  "2pl": "pronoun.possessive.2pl",
  "3pl": "pronoun.possessive.3pl",
} as const satisfies Record<string, UiStringKey>;

export function possessiveHintKey(features: PronominalPossessor): UiStringKey {
  const pn = `${features.person}${features.number === "plural" ? "pl" : "sg"}`;
  if (pn === "3sg")
    return features.gender === "fem"
      ? "pronoun.possessive.3sg.fem"
      : features.gender === "neut"
        ? "pronoun.possessive.3sg.neut"
        : "pronoun.possessive.3sg.masc";
  return POSSESSIVE_KEY[pn as keyof typeof POSSESSIVE_KEY];
}
