import { type Concept, type Definiteness, type NounElement, type NounPhrase, type Possessor } from "@signi/shared";
import {
  POSSESSOR_KEY,
  POSSESSOR_REF_KEY,
  STANDARD_KEY,
  EXAMPLES_KEY,
  type NounAddress,
  type NounKey,
  type PhraseSelection,
} from "../../interfaces.ts";
import { approximatorFor } from "../../functions/approximatorFor.ts";
import { comparedAdjectiveIndex, takesStandardOrSet } from "../../functions/comparison.ts";
import { buildNounElement } from "./buildNounElement.ts";
import { field } from "./field.ts";
import { modifiers } from "./modifiers.ts";
import { resolveAntecedent } from "./resolveAntecedent.ts";

// Build one noun phrase from the flat `${which}*` fields. Relative clauses are no longer
// stored in the selection — they are cross-container links assembled in workspacePlan,
// which attaches `.relative` to the noun phrases this returns. `root` is the whole period
// selection, needed to resolve a pronominal possessor's antecedent address; it defaults to
// `sel` for the top-level call and is threaded unchanged through every recursion.
export function buildNounPhrase(sel: PhraseSelection, which: NounKey, root: PhraseSelection = sel): NounPhrase | undefined {
  const concept = field<Concept>(sel, which);
  if (!concept) return undefined;
  // A possessor is one of two shapes. A pronominal reference ("his") points at an antecedent noun
  // in the period and resolves to its features; otherwise a genitive possessor is a nested noun
  // phrase whose head lives in its `subject` slot, recursing for its own number/gender/adjectives/
  // nested possessor. The reference wins when both somehow coexist (the UI keeps them exclusive).
  const possRef = field<NounAddress>(sel, POSSESSOR_REF_KEY(which));
  const possSel = field<PhraseSelection>(sel, POSSESSOR_KEY(which));
  const possessor: Possessor | undefined = possRef
    ? resolveAntecedent(root, possRef)?.features
    : possSel
      ? buildNounPhrase(possSel, "subject", root)
      : undefined;
  const { adjectives, adjectiveDegrees, nounModifiers } = modifiers(sel, which);
  return {
    concept: concept.id,
    // An adjective head is the predicate adjective of the subject complement ("seems
    // happy") — the one head that is compared, so it carries a degree of its own, stored
    // under the head's own slot key. A noun/pronoun head has none.
    headDegree: concept.role === "adjective" ? sel.adjectiveDegrees?.[which] : undefined,
    // What that adjective is compared to ("bigger than the dog", P09-E12 D5): a nested noun phrase
    // headed by its `subject`, like a possessor, but a whole noun element — it may coordinate. It is
    // passed on every degree but the positive, the degrees whose ring the canvas draws undimmed: a
    // rival on the comparatives and the equative, the superlative's set on `most` / `least` ("the
    // biggest of the dogs", P09-E19, E51). The translator drops it on the positive.
    headStandard:
      concept.role === "adjective" && takesStandardOrSet(sel.adjectiveDegrees?.[which])
        ? standardOf(sel, which, root)
        : undefined,
    // A noun head's standard is its compared adjective's ("a bigger cat than the dog", P09-E50 D1):
    // placed at that adjective's index among `adjectives`, and left out when none compares.
    adjectiveStandards: concept.role === "noun" ? adjectiveStandardsOf(sel, which, root) : undefined,
    number: field<"singular" | "plural">(sel, `${which}Number`),
    gender: field<"masc" | "fem" | "neut">(sel, `${which}Gender`),
    // Only subject/directObject and the predicative subject complement carry a
    // definiteness field (the adposition-free slots); elsewhere this is undefined and
    // the engines default to 'definite'.
    definiteness: field<Definiteness>(sel, `${which}Definiteness`),
    adjectives,
    adjectiveDegrees,
    nounModifiers,
    possessor,
    // A demonstrative pointing away from the rest (P13).
    contrastive: sel.contrastives?.[which] || undefined,
    // The members of its set it names after it ("animals such as the cat", P09-E48): a noun head's.
    examples: concept.role === "noun" ? examplesOf(sel, which, root) : undefined,
    // A cardinal numeral counting it (P13).
    numeral: sel.numerals?.[which],
    // An approximator on that quantity (P09-E49), its word the quantity's own.
    approximator: sel.approximators?.[which] ? approximatorFor(sel, which) : undefined,
    // What a genitive possessor is to the head (P13): an owner unless the noun says otherwise.
    possessorRole: possSel && !possRef ? sel.possessorRoles?.[which] : undefined,
  };
}

function standardOf(sel: PhraseSelection, which: NounKey, root: PhraseSelection) {
  const standard = field<PhraseSelection>(sel, STANDARD_KEY(which));
  return standard ? buildNounElement(standard, "subject", root) : undefined;
}

function examplesOf(sel: PhraseSelection, which: NounKey, root: PhraseSelection): NounPhrase["examples"] {
  const slice = field<PhraseSelection>(sel, EXAMPLES_KEY(which));
  const phrase = slice ? buildNounElement(slice, "subject", root) : undefined;
  return phrase && { phrase, relation: sel.exampleRelations?.[which] ?? "example" };
}

function adjectiveStandardsOf(sel: PhraseSelection, which: NounKey, root: PhraseSelection) {
  const index = comparedAdjectiveIndex(sel, which);
  const standard = index === undefined ? undefined : standardOf(sel, which, root);
  if (index === undefined || !standard) return undefined;
  const entries: (NounElement | undefined)[] = Array.from({ length: index + 1 }, () => undefined);
  entries[index] = standard;
  return entries;
}

