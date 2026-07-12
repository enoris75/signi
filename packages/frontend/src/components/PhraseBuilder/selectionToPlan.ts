import type {
  Complement,
  ComplementType,
  Definiteness,
  Degree,
  ModifierRelation,
  NounModifier,
  NounPhrase,
  PhrasePlan,
  VerbPhrase,
} from "@signi/shared";
import { COMPLEMENT_TYPES } from "@signi/shared";
import type { Concept } from "@signi/shared";
import { NounKey, PhraseSelection, POSSESSOR_KEY } from "./interfaces.ts";
import { adjectiveSlots, MODAL_SLOTS } from "./slots.ts";

// Read a dynamically-keyed field off a selection. The flat keys (`${which}Number`,
// `${which}Adjective`, …) all exist on PhraseSelection; the union index widens the
// value type, so callers pass the concrete field type as T.
function field<T>(sel: PhraseSelection, key: string): T | undefined {
  return sel[key as keyof PhraseSelection] as T | undefined;
}

// Split the adjective slots of a noun block by the picked concept's role: real
// adjectives become `adjectives`, nouns become attributive `nounModifiers` carrying the
// slot's chosen relation (defaulting to 'feature'). This is the "Adjective ⇄ Noun" switch.
function modifiers(sel: PhraseSelection, which: NounKey): { adjectives: string[]; adjectiveDegrees: Degree[]; nounModifiers: NounModifier[] } {
  const adjectives: string[] = [];
  // Index-aligned with `adjectives`: each real adjective's chosen degree (default 'positive').
  const adjectiveDegrees: Degree[] = [];
  const nounModifiers: NounModifier[] = [];
  for (const key of adjectiveSlots(which)) {
    const c = field<Concept>(sel, key);
    if (!c) continue;
    if (c.role === "noun") {
      const relation = sel.modifierRelations?.[key] ?? "feature";
      // The modifier's own number ("di frasi") and any adjective modifying it ("di frasi
      // semantiche") — both scoped to the modifier, not the head. Omit when at defaults.
      const number = sel.modifierNumbers?.[key];
      const modAdj = sel.modifierAdjectives?.[key];
      nounModifiers.push({
        concept: c.id,
        relation: relation as ModifierRelation,
        ...(number === "plural" && { number }),
        ...(modAdj && { adjectives: [modAdj.id] }),
      });
    } else {
      adjectives.push(c.id);
      adjectiveDegrees.push(sel.adjectiveDegrees?.[key] ?? "positive");
    }
  }
  return { adjectives, adjectiveDegrees, nounModifiers };
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
  const { adjectives, adjectiveDegrees, nounModifiers } = modifiers(sel, which);
  return {
    concept: concept.id,
    // An adjective head is the predicate adjective of the subject complement ("seems
    // happy") — the one head that is compared, so it carries a degree of its own, stored
    // under the head's own slot key. A noun/pronoun head has none.
    headDegree: concept.role === "adjective" ? sel.adjectiveDegrees?.[which] : undefined,
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
  };
}

// A verbless period (a bare noun phrase like "breaking news") has no verb phrase — return
// undefined so the plan omits it and the engines render just the subject.
export function buildVerbPhrase(sel: PhraseSelection): VerbPhrase | undefined {
  if (!sel.verb) return undefined;
  // The modal chain, outermost first. Filtering (rather than stopping at the first empty
  // slot) keeps a chain with a hole in it meaningful: whatever modals are set still apply.
  const modals = MODAL_SLOTS.map((key) => field<Concept>(sel, key)?.id).filter(
    (id): id is string => Boolean(id),
  );
  return {
    verb: sel.verb.id,
    negative: sel.verbNegative,
    tense: sel.verbTense,
    aspect: sel.verbAspect,
    modifier: sel.modifier?.id,
    ...(modals.length > 0 && { modals }),
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
      // Route carries a path specifier; cause carries a sentiment specifier (omit the
      // default 'neutral' — the engine assumes it when absent).
      specifiers:
        type === "route" && sel.routeSpecifier
          ? [{ kind: "path", value: sel.routeSpecifier }]
          : type === "cause" && sel.causeSentiment && sel.causeSentiment !== "neutral"
            ? [{ kind: "sentiment", value: sel.causeSentiment }]
            : undefined,
    };
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export { buildComplements };

// The pronoun (concept + number) an imperative addressee maps to. The engines drop the subject
// but read its person/number to pick the imperative form: tu (2sg) / "let's" (1pl) / plural (2pl).
function imperativeSubject(person: PhraseSelection["imperativePerson"]): NounPhrase {
  switch (person) {
    case "1pl": return { concept: "FIRST_PERSON", number: "plural" };   // "let's …"
    case "2pl": return { concept: "SECOND_PERSON", number: "plural" };
    default:    return { concept: "SECOND_PERSON", number: "singular" }; // 2sg (default)
  }
}

// Serialise one container's flat selection into a wire PhrasePlan (its noun phrases carry
// no relative clauses; those are attached from cross-container links in workspacePlan.ts).
export function selectionToPlan(sel: PhraseSelection): Partial<PhrasePlan> {
  // An imperative is a command, so it only takes effect once there is a verb to command.
  // Until then the period behaves like any other: an empty container stays empty instead of
  // leaking the synthesised addressee pronoun ("you.") that the subject-dropping mood would
  // otherwise render with no verb to attach to.
  const imperative = Boolean(sel.imperative && sel.verb);
  return {
    // An imperative synthesises its subject from the chosen addressee (the user's own subject
    // pick is left untouched in the selection, so toggling the command off restores it).
    subject: imperative
      ? imperativeSubject(sel.imperativePerson)
      : buildNounPhrase(sel, "subject"),
    verbPhrase: buildVerbPhrase(sel),
    directObject: buildNounPhrase(sel, "directObject"),
    indirectObject: buildNounPhrase(sel, "indirectObject"),
    complements: buildComplements(sel),
    // The register rides along with the mood: absent ⇒ 'request', a command spoken to the
    // addressee above. 'instruction' addresses nobody, and the engines then ignore the person.
    ...(imperative && {
      imperative: true,
      ...(sel.imperativeRegister && { imperativeRegister: sel.imperativeRegister }),
    }),
  };
}
