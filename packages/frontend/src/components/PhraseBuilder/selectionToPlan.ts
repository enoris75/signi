import type {
  Complement,
  ComplementType,
  Definiteness,
  ModifierRelation,
  NounModifier,
  NounPhrase,
  PhrasePlan,
  VerbPhrase,
} from "@signi/shared";
import { COMPLEMENT_TYPES } from "@signi/shared";
import type { Concept } from "@signi/shared";
import { NounKey, PhraseSelection, POSSESSOR_KEY } from "./interfaces.ts";

// Read a dynamically-keyed field off a selection. The flat keys (`${which}Number`,
// `${which}Adjective`, …) all exist on PhraseSelection; the union index widens the
// value type, so callers pass the concrete field type as T.
function field<T>(sel: PhraseSelection, key: string): T | undefined {
  return sel[key as keyof PhraseSelection] as T | undefined;
}

// Split the two adjective slots of a noun block by the picked concept's role: real
// adjectives become `adjectives`, nouns become attributive `nounModifiers` carrying the
// slot's chosen relation (defaulting to 'feature'). This is the "Adjective ⇄ Noun" switch.
function modifiers(sel: PhraseSelection, which: NounKey): { adjectives: string[]; nounModifiers: NounModifier[] } {
  const adjectives: string[] = [];
  const nounModifiers: NounModifier[] = [];
  for (const key of [`${which}Adjective`, `${which}Adjective2`]) {
    const c = field<Concept>(sel, key);
    if (!c) continue;
    if (c.role === "noun") {
      const relation = sel.modifierRelations?.[key] ?? "feature";
      nounModifiers.push({ concept: c.id, relation: relation as ModifierRelation });
    } else {
      adjectives.push(c.id);
    }
  }
  return { adjectives, nounModifiers };
}

// Build one noun phrase from the flat `${which}*` fields. Relative clauses are no longer
// stored in the selection — they are cross-container links assembled in workspacePlan.ts,
// which attaches `.relative` to the noun phrases this returns.
export function buildNounPhrase(sel: PhraseSelection, which: NounKey): NounPhrase | undefined {
  const concept = field<Concept>(sel, which);
  if (!concept) return undefined;
  // A possessor is a nested noun phrase whose head lives in its `subject` slot; recursing
  // through buildNounPhrase gives it its own number/gender/adjectives/nested possessor.
  const possSel = field<PhraseSelection>(sel, POSSESSOR_KEY(which));
  const possessor = possSel ? buildNounPhrase(possSel, "subject") : undefined;
  const { adjectives, nounModifiers } = modifiers(sel, which);
  return {
    concept: concept.id,
    number: field<"singular" | "plural">(sel, `${which}Number`),
    gender: field<"masc" | "fem">(sel, `${which}Gender`),
    // Only subject/directObject carry a definiteness field today; elsewhere this is
    // undefined and the engines default to 'definite'.
    definiteness: field<Definiteness>(sel, `${which}Definiteness`),
    adjectives,
    nounModifiers,
    possessor,
  };
}

export function buildVerbPhrase(sel: PhraseSelection): VerbPhrase {
  return {
    verb: sel.verb?.id as string,
    negative: sel.verbNegative,
    tense: sel.verbTense,
    modifier: sel.modifier?.id,
  };
}

function buildComplements(
  sel: PhraseSelection,
): Partial<Record<ComplementType, Complement>> | undefined {
  const out: Partial<Record<ComplementType, Complement>> = {};
  for (const type of COMPLEMENT_TYPES) {
    const phrase = buildNounPhrase(sel, type);
    if (!phrase) continue;
    out[type] = {
      phrase,
      specifiers:
        type === "route" && sel.routeSpecifier
          ? [{ kind: "path", value: sel.routeSpecifier }]
          : undefined,
    };
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export { buildComplements };

// Serialise one container's flat selection into a wire PhrasePlan (its noun phrases carry
// no relative clauses; those are attached from cross-container links in workspacePlan.ts).
export function selectionToPlan(sel: PhraseSelection): Partial<PhrasePlan> {
  return {
    subject: buildNounPhrase(sel, "subject"),
    verbPhrase: buildVerbPhrase(sel),
    directObject: buildNounPhrase(sel, "directObject"),
    indirectObject: buildNounPhrase(sel, "indirectObject"),
    complements: buildComplements(sel),
  };
}
