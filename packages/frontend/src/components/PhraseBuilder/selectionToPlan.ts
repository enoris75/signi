import type {
  Complement,
  ComplementType,
  CoordConjunction,
  Definiteness,
  Degree,
  ModalVerb,
  ModifierRelation,
  NounElement,
  NounModifier,
  NounPhrase,
  PhrasePlan,
  Possessor,
  PronominalPossessor,
  VerbPhrase,
} from "@signi/shared";
import type { Concept } from "@signi/shared";
import { CONJUNCTION_KEY, CONJUNCTS_KEY, NounAddress, NounKey, PhraseSelection, POSSESSOR_KEY, POSSESSOR_REF_KEY } from "./interfaces.ts";
import { adjectiveSlots, BOX_COMPLEMENT_TYPES, modalAdverbFor, MODAL_SLOTS } from "./slots.ts";

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

// Resolve a *pronominal* possessor reference into concrete features. `address` points at an
// antecedent noun elsewhere in the same period (`root`); we navigate to it — mirroring `getNoun`
// in workspacePlan, but over the selection so we can read the Concept's own person — and read off
// the person/number/gender the possessive pronoun agrees with. A pronoun antecedent supplies its
// own person/number; a noun is 3rd person, singular unless the user set it plural. The gender is
// the antecedent's grammatical-gender pick (drives en his/her/its, de sein/ihr). Returns undefined
// if the address no longer resolves (the antecedent was deleted), so the possessor just drops.
export function resolveAntecedent(
  root: PhraseSelection,
  address: NounAddress,
): { concept: Concept; features: PronominalPossessor } | undefined {
  const [base, ...steps] = address.split("/");
  let sel: PhraseSelection = root;
  let key = base;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i] === "possessor") {
      const child = field<PhraseSelection>(sel, `${key}Possessor`);
      if (!child) return undefined;
      sel = child;
      key = "subject";
    } else if (steps[i] === "conjunct") {
      const idx = Number(steps[++i]);
      const child = field<PhraseSelection[]>(sel, `${key}Conjuncts`)?.[idx];
      if (!child) return undefined;
      sel = child;
      key = "subject";
    } else {
      return undefined;
    }
  }
  const concept = field<Concept>(sel, key);
  if (!concept) return undefined;
  const person = (concept.person ?? "3") as "1" | "2" | "3";
  const number = field<"singular" | "plural">(sel, `${key}Number`) ?? concept.number ?? "singular";
  const gender = field<"masc" | "fem" | "neut">(sel, `${key}Gender`);
  return { concept, features: { kind: "pronominal", person, number, ...(gender && { gender }) } };
}

// Build one noun phrase from the flat `${which}*` fields. Relative clauses are no longer
// stored in the selection — they are cross-container links assembled in workspacePlan.ts,
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

/**
 * Build the noun *element* filling a slot: the block's own noun phrase, plus any conjuncts
 * coordinated with it. Each conjunct is a nested selection whose head lives in its `subject`
 * slot, so it goes through `buildNounPhrase` exactly as a possessor does — which is what gives
 * a conjunct its own determiner, number/gender, adjectives, possessor and relative clause.
 *
 * A group needs at least two phrases, so a conjunct panel that is open but still empty
 * contributes nothing and the slot stays a plain noun phrase — the same rule the instrumental
 * link follows (a half-built period renders no complement rather than half of one).
 */
export function buildNounElement(sel: PhraseSelection, which: NounKey, root: PhraseSelection = sel): NounElement | undefined {
  const head = buildNounPhrase(sel, which, root);
  if (!head) return undefined;
  const conjuncts = (field<PhraseSelection[]>(sel, CONJUNCTS_KEY(which)) ?? [])
    .map((c) => buildNounPhrase(c, "subject", root))
    .filter((np): np is NounPhrase => Boolean(np));
  if (conjuncts.length === 0) return head;
  return {
    conjuncts: [head, ...conjuncts],
    conjunction: field<CoordConjunction>(sel, CONJUNCTION_KEY(which)) ?? "and",
  };
}

// A verbless period (a bare noun phrase like "breaking news") has no verb phrase — return
// undefined so the plan omits it and the engines render just the subject.
export function buildVerbPhrase(sel: PhraseSelection): VerbPhrase | undefined {
  if (!sel.verb) return undefined;
  // The modal chain, outermost first. Filtering (rather than stopping at the first empty
  // slot) keeps a chain with a hole in it meaningful: whatever modals are set still apply. Each
  // modal carries its own adverb (paired slot) when one is set — "never wanted to always go".
  const modals = MODAL_SLOTS.map((key): ModalVerb | undefined => {
    const verb = field<Concept>(sel, key)?.id;
    if (!verb) return undefined;
    const adverbKey = modalAdverbFor(key);
    const modifier = adverbKey ? field<Concept>(sel, adverbKey)?.id : undefined;
    return modifier ? { verb, modifier } : { verb };
  }).filter((m): m is ModalVerb => Boolean(m));
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
  for (const type of BOX_COMPLEMENT_TYPES) {
    const phrase = buildNounElement(sel, type);
    if (!phrase) continue;
    out[type] = {
      phrase,
      // Route and locative both carry a path specifier — the same relation set, read from their
      // own key because their defaults differ (through vs in). Cause carries a sentiment
      // specifier (omit the default 'neutral' — the engine assumes it when absent).
      specifiers:
        type === "route" && sel.routeSpecifier
          ? [{ kind: "path", value: sel.routeSpecifier }]
          : type === "locative" && sel.locativeSpecifier
            ? [{ kind: "path", value: sel.locativeSpecifier }]
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
  // The infinitive citation is likewise a subject-dropping mood that needs a verb to cite; until
  // one is picked the period stays a plain (buildable) subject. The engines drop the subject, so
  // it takes a throwaway GENERIC_PERSON purely to satisfy the plan's required `subject` field —
  // the same placeholder the seeded verb definitions use.
  const infinitive = Boolean(sel.infinitive && sel.verb);
  return {
    // An imperative synthesises its subject from the chosen addressee (the user's own subject
    // pick is left untouched in the selection, so toggling the command off restores it); an
    // infinitive drops it entirely behind the impersonal placeholder.
    subject: imperative
      ? imperativeSubject(sel.imperativePerson)
      : infinitive
        ? { concept: "GENERIC_PERSON" }
        : buildNounElement(sel, "subject"),
    verbPhrase: buildVerbPhrase(sel),
    directObject: buildNounElement(sel, "directObject"),
    complements: buildComplements(sel),
    // The register rides along with the mood: absent ⇒ 'request', a command spoken to the
    // addressee above. 'instruction' addresses nobody, and the engines then ignore the person.
    ...(imperative && {
      imperative: true,
      ...(sel.imperativeRegister && { imperativeRegister: sel.imperativeRegister }),
    }),
    ...(infinitive && { infinitive: true }),
  };
}
