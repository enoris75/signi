import { defaultDefiniteness, type Concept } from "@signi/shared";
import {
  isConditionalLink,
  isCoordinativeLink,
  isInstrumentalLink,
  type PhraseLink,
  type PhraseSelection,
} from "../../components/PhraseBuilder/interfaces.ts";
import { resolveAntecedent } from "../../components/PhraseBuilder/selectionToPlan/index.ts";
import type { WorkspaceState } from "./types.ts";

/**
 * What a workspace *says*, with everything that only says it differently taken out: a value left at
 * its default and one set to it, a concept object and its id, a period's random id and its place in
 * the stack. Two workspaces that normalise alike render alike — which is what "the same state" means
 * for the round trip, and for whether a line changed anything.
 */

type Json = string | number | boolean | Json[] | { [k: string]: Json };

const DEFAULTS: Record<string, string> = {
  verbTense: "present",
  verbAspect: "neutral",
  verbVoice: "active",
  causeSentiment: "neutral",
  routeSpecifier: "through",
  locativeSpecifier: "in",
  imperativeRegister: "request",
};

const isConcept = (v: unknown): v is Concept =>
  typeof v === "object" && v !== null && "id" in v && "role" in v;

function normalizeSelection(sel: PhraseSelection, root: PhraseSelection = sel): { [k: string]: Json } {
  const out: { [k: string]: Json } = {};
  for (const [key, value] of Object.entries(sel).sort(([a], [b]) => a.localeCompare(b))) {
    if (value === undefined || value === null || value === false) continue;
    // A head's settings mean nothing without the head.
    const head = key.match(/^(.+?)(Number|Gender|Definiteness|Conjunction|Conjuncts)$/)?.[1];
    if (head && !sel[head as keyof PhraseSelection]) continue;
    if (key === "imperativePerson" && (!sel.imperative || value === "2sg")) continue;
    if (key === "imperativeRegister" && !sel.imperative) continue;
    if (DEFAULTS[key] === value) continue;
    if (key.endsWith("Number") && value === "singular") continue;
    if (key.endsWith("Gender") && value === "masc") continue;
    if (key.endsWith("Conjunction") && value === "and") continue;
    if (key.endsWith("Definiteness") && value === defaultDefiniteness(key.replace(/Definiteness$/, ""))) continue;
    // A possessor pointing at a noun that has since gone renders no possessor at all.
    if (key.endsWith("PossessorRef") && !resolveAntecedent(root, value as string)) continue;
    if (isConcept(value)) {
      out[key] = value.id;
    } else if (Array.isArray(value)) {
      if (value.length) out[key] = value.map((v) => normalizeSelection(v as PhraseSelection, root));
    } else if (typeof value === "object") {
      // A possessor, or a predicate adjective's standard of comparison: a phrase of its own.
      if (key.endsWith("Possessor") || key.endsWith("Standard")) {
        const nested = normalizeSelection(value as PhraseSelection, root);
        if (Object.keys(nested).length) out[key] = nested;
        continue;
      }
      // A per-slot settings map: only its entries away from the default, for a slot that holds a word.
      const map: { [k: string]: Json } = {};
      for (const [slot, v] of Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))) {
        const held = sel[slot as keyof PhraseSelection] as Concept | undefined;
        if (v === undefined || !held) continue;
        // A degree is a real adjective's, a relation, number or adjective a noun modifier's: left on a
        // slot whose word is now of the other kind, it is latent, and renders nothing.
        if (key === "adjectiveDegrees" && held.role !== "adjective") continue;
        if (key !== "adjectiveDegrees" && held.role !== "noun") continue;
        if (key === "adjectiveDegrees" && v === "positive") continue;
        if (key === "modifierRelations" && v === "feature") continue;
        if (key === "modifierNumbers" && v === "singular") continue;
        map[slot] = isConcept(v) ? v.id : (v as Json);
      }
      if (Object.keys(map).length) out[key] = map;
    } else {
      out[key] = value as Json;
    }
  }
  return out;
}

function normalizeLink(link: PhraseLink, index: Map<string, number>): { [k: string]: Json } {
  const s = index.get(link.source.containerId) ?? -1;
  const t = index.get(link.target.containerId) ?? -1;
  if (isConditionalLink(link)) return { kind: "conditional", s, t };
  if (isCoordinativeLink(link)) return { kind: "coordinative", s, t, conjunction: link.conjunction };
  if (isInstrumentalLink(link)) return { kind: "instrumental", s, t, level: link.level ?? "object" };
  return { kind: "relative", s, sn: link.source.nounKey, t, tn: link.target.nounKey };
}

export function normalizeWorkspace(state: WorkspaceState): Json {
  const index = new Map(state.containers.map((c, i) => [c.id, i]));
  return {
    periods: state.containers.map((c) => normalizeSelection(c.selection)),
    // A link with an end in no period links nothing.
    links: state.links
      .filter((l) => index.has(l.source.containerId) && index.has(l.target.containerId))
      .map((l) => normalizeLink(l, index))
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  };
}

/** Whether two workspaces say the same thing. */
export function sameWorkspace(a: WorkspaceState, b: WorkspaceState): boolean {
  return JSON.stringify(normalizeWorkspace(a)) === JSON.stringify(normalizeWorkspace(b));
}
