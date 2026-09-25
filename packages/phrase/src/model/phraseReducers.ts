import {
  ASPECTS,
  DEFAULT_TEMPORAL_RELATION,
  DEGREES,
  MODIFIER_RELATIONS,
  NOUN_COORD_CONJUNCTIONS,
  TEMPORAL_RELATIONS,
  TENSES,
  VOICES,
  type Aspect,
  type CauseSentiment,
  type Concept,
  type CoordConjunction,
  type Definiteness,
  type Degree,
  type ImperativeRegister,
  type ModifierRelation,
  type ObjectPredication,
  type PathSpecifier,
  type Tense,
  type TemporalRelation,
  type Voice,
} from "@signi/shared";
import { approximatorFor } from "./functions/approximatorFor.ts";
import {
  CONJUNCTION_KEY,
  CONJUNCTS_KEY,
  ConceptSelectOpts,
  GenderSlot,
  ImperativePerson,
  NOUN_GLOSSES,
  POSSESSOR_ROLES,
  type PossessorRole,
  NounAddress,
  NounGloss,
  NounKey,
  NumberSlot,
  PhraseSelection,
  POSSESSOR_KEY,
  POSSESSOR_REF_KEY,
  QuestionRole,
  SlotKey,
  STANDARD_KEY,
  EXAMPLES_KEY,
} from "./interfaces.ts";
import { questionAnimateOf } from "./functions/questionGates.ts";
import type { ModalNegativeField } from "./slots.ts";
import {
  adjectiveSlots,
  BOX_COMPLEMENT_TYPES,
  COMPLEMENT_KEY_SET,
  defaultPredication,
  getActiveSlots,
  modalAdverbFor,
  modalNegativeFor,
  MODAL_SLOTS,
  NOUN_KEYS,
  offeredComplements,
} from "./slots.ts";

/** A polarity field of the verb group: the main verb's, or one of the modals' own. */
export type NegativeField = "verbNegative" | ModalNegativeField;

// The settings kept per slot in maps keyed by slot key, rather than as fields of their own:
// an adjective's degree (or the predicate adjective's, under `predicative`) and a noun-modifier's
// relation, number and own adjective.
const SLOT_SETTING_MAPS = [
  "adjectiveDegrees",
  "modifierRelations",
  "modifierNumbers",
  "modifierAdjectives",
] as const;

// Drop the keyed settings of `keys`, so a word placed in one of those slots later starts from the
// defaults rather than inheriting the last word's. Each map is copied before it is touched (`sel`
// is a shallow copy, so its maps are still the previous selection's), and dropped once empty.
function clearSlotSettings(sel: PhraseSelection, keys: readonly string[]): void {
  for (const name of SLOT_SETTING_MAPS) {
    const map = sel[name];
    if (!map || !keys.some((key) => key in map)) continue;
    const rest: Record<string, unknown> = { ...map };
    for (const key of keys) delete rest[key];
    if (Object.keys(rest).length) (sel[name] as Record<string, unknown>) = rest;
    else delete sel[name];
  }
}

// Drop every adjective of a noun block — the whole chain, since a later link is
// meaningless without the earlier ones — along with their keyed settings.
function clearAdjectives(sel: PhraseSelection, which: NounKey): void {
  const chain = adjectiveSlots(which);
  for (const key of chain)
    delete sel[key as keyof PhraseSelection];
  clearSlotSettings(sel, chain);
}

// Drop the adjectives chained *after* `slot`, which is itself an adjective slot. Used when
// that slot is cleared or its word replaced: the controls that revealed the later links
// live on this box, so they must go with it.
function clearChainedAdjectives(
  sel: PhraseSelection,
  which: NounKey,
  slot: SlotKey,
): void {
  const chain = adjectiveSlots(which);
  const idx = chain.indexOf(slot);
  if (idx === -1) return;
  const chained = chain.slice(idx + 1);
  for (const key of chained)
    delete sel[key as keyof PhraseSelection];
  clearSlotSettings(sel, chained);
}

// Only a noun head makes a full noun phrase: a pronoun ("because of her") or a predicate adjective
// ("seems happy") takes no article and no possessor — neither a genitive nor a pronominal one.
function clearNounPhraseParts(sel: PhraseSelection, which: NounKey): void {
  delete sel[`${which}Definiteness` as keyof PhraseSelection];
  delete sel[POSSESSOR_KEY(which)];
  delete sel[POSSESSOR_REF_KEY(which)];
  if (sel.contrastives?.[which]) {
    const { [which]: _contrast, ...rest } = sel.contrastives;
    if (Object.keys(rest).length > 0) sel.contrastives = rest;
    else delete sel.contrastives;
  }
  if (sel.numerals?.[which] !== undefined) {
    const { [which]: _count, ...others } = sel.numerals;
    if (Object.keys(others).length > 0) sel.numerals = others;
    else delete sel.numerals;
  }
  if (sel.approximators?.[which]) {
    const { [which]: _approx, ...rest } = sel.approximators;
    if (Object.keys(rest).length > 0) sel.approximators = rest;
    else delete sel.approximators;
  }
  if (sel.possessorRoles?.[which]) {
    const { [which]: _dropped, ...rest } = sel.possessorRoles;
    if (Object.keys(rest).length > 0) sel.possessorRoles = rest;
    else delete sel.possessorRoles;
  }
  // Examples name members of a set a noun names (P09-E48): a pronoun or an adjective head has none.
  delete sel[EXAMPLES_KEY(which)];
  if (sel.exampleRelations?.[which]) {
    const { [which]: _dropped, ...rest } = sel.exampleRelations;
    if (Object.keys(rest).length > 0) sel.exampleRelations = rest;
    else delete sel.exampleRelations;
  }
  // A subject's reading (P13) is a noun phrase's: a pronoun or an adjective has none.
  if (which === "subject") {
    delete sel.subjectGloss;
    delete sel.subjectGlossRelation;
  }
}

// Drop everything a noun block holds besides its head — number, gender, determiner, adjectives,
// possessor, conjuncts and the complement-specific relation — for when the head itself goes. None
// of it is visible without a head, but left behind it would resurface on the next noun placed in
// the block (the same resurrection `removeConjunct` guards its conjunction against).
function clearNoun(sel: PhraseSelection, which: NounKey): void {
  delete sel[which as keyof PhraseSelection];
  delete sel[`${which}Number` as keyof PhraseSelection];
  delete sel[`${which}Gender` as keyof PhraseSelection];
  clearNounPhraseParts(sel, which);
  clearAdjectives(sel, which);
  clearSlotSettings(sel, [which]);
  delete sel[CONJUNCTS_KEY(which)];
  delete sel[CONJUNCTION_KEY(which)];
  dropCorrelative(sel, which);
  delete sel[STANDARD_KEY(which)];
  if (which === "route") delete sel.routeSpecifier;
  if (which === "locative") delete sel.locativeSpecifier;
  if (which === "direction") delete sel.directionSpecifier;
  if (which === "temporal") delete sel.temporalRelation;
  if (which === "objectPredicative") delete sel.objectPredicativePredication;
  if (which === "cause") {
    delete sel.causeSentiment;
    delete sel.causeNegative;
  }
}

// Drop the modals chained *after* `slot` — same reasoning as the adjectives: the control
// that reveals a governed modal rides its governor's box, so it goes when that box does.
// `slot` may be the verb, which clears the whole chain (a modal with no verb to govern is
// meaningless), a modal, or anything else (a no-op).
function clearChainedModals(sel: PhraseSelection, slot: SlotKey): void {
  const idx = MODAL_SLOTS.indexOf(slot);
  if (idx === -1 && slot !== "verb") return;
  for (const key of MODAL_SLOTS.slice(idx + 1)) {
    delete sel[key as keyof PhraseSelection];
    // A cleared modal takes its own adverb and its own polarity with it — both controls ride the
    // modal's box, so neither can be reached once that box is gone.
    const advKey = modalAdverbFor(key);
    if (advKey) delete sel[advKey as keyof PhraseSelection];
    const negKey = modalNegativeFor(key);
    if (negKey) delete sel[negKey as keyof PhraseSelection];
  }
}

// The gender a gendered noun keeps from the word it replaces. A noun is masculine or feminine; the
// neuter a 3rd-person pronoun ("it") left behind is no gender its control offers, so it goes back to
// the masculine rather than lingering where no key or click could reach it.
function nounGender(prev: Gender | undefined): "masc" | "fem" {
  return prev === "fem" ? "fem" : "masc";
}

// Pure state transform: place `concept` into `slot`, cascading the side effects
// that keep the selection internally consistent (dropping now-invalid dependents,
// seeding default gender/number, clearing chained adjectives, etc.). A picker that decided the
// word's number or gender alongside it (the pronoun chooser) passes that in `opts`, which overrides
// the defaults seeded here.
export function applyConceptSelect(
  prev: PhraseSelection,
  slot: SlotKey,
  concept: Concept,
  opts?: ConceptSelectOpts,
): PhraseSelection {
  const next = { ...prev, [slot]: concept };
  if (slot === "verb") {
    const nowVisible = getActiveSlots(
      concept.transitivity,
      prev.subject?.role,
      Boolean(prev.subjectAdjective),
      offeredComplements(concept),
    ).map((s) => s.key);
    if (!nowVisible.includes("directObject")) clearNoun(next, "directObject");
    if (!nowVisible.includes("subjectAdjective")) clearAdjectives(next, "subject");
    // Only a verb with a patient has a passive to be in (see `VerbPhrase.voice`), so a verb that
    // has none takes the voice back to active rather than leaving a setting nothing can act on.
    if (concept.transitivity !== "transitive" && concept.transitivity !== "ditransitive") {
      delete next.verbVoice;
    }
    // Drop complements the new verb no longer licenses.
    for (const type of BOX_COMPLEMENT_TYPES) {
      if (!nowVisible.includes(type)) clearNoun(next, type);
    }
  }
  if (slot === "subject") {
    clearAdjectives(next, "subject");
    if (concept.role !== "noun") clearNounPhraseParts(next, "subject");
    if (concept.role === "pronoun") {
      next.subjectNumber = "singular";
      // Gender applies to every pronoun person (participle/adjective agreement in Romance);
      // neuter is 3rd-person only, so clamp a stale 'neut' when switching to 1st/2nd.
      const g = prev.subjectGender ?? "masc";
      next.subjectGender = concept.person !== "3" && g === "neut" ? "masc" : g;
    } else if (concept.role === "noun") {
      if (concept.gendered) {
        next.subjectGender = nounGender(prev.subjectGender);
      } else {
        delete next.subjectGender;
      }
    } else {
      delete next.subjectNumber;
      delete next.subjectGender;
    }
  }
  if (slot === "directObject") {
    clearAdjectives(next, "directObject");
    // A pronoun object is no full noun phrase either ("the cat sees me", not "sees the me"):
    // it takes no article and no possessor, and it is singular until the chooser says otherwise.
    // Gender is seeded like the subject's (neuter clamped off 1st/2nd person); what reads it is
    // the 3rd-person clitic ("lo" / "la" / "li" / "le") and the participle that agrees with it.
    if (concept.role !== "noun") clearNounPhraseParts(next, "directObject");
    if (concept.role === "pronoun") {
      next.directObjectNumber = "singular";
      const g = prev.directObjectGender ?? "masc";
      next.directObjectGender = concept.person !== "3" && g === "neut" ? "masc" : g;
    } else if (concept.gendered) {
      next.directObjectGender = nounGender(prev.directObjectGender);
    } else {
      delete next.directObjectGender;
    }
  }
  if (COMPLEMENT_KEY_SET.has(slot)) {
    // Swapping the complement noun invalidates its adjectives.
    clearAdjectives(next, slot as NounKey);
    const gKey = `${slot}Gender` as keyof PhraseSelection;
    if (concept.gendered) {
      (next[gKey] as "masc" | "fem") = nounGender(prev[gKey] as Gender | undefined);
    } else {
      delete next[gKey];
    }
    // A predicate adjective or a pronoun cause is no full noun phrase; the adjective additionally
    // carries no number of its own — it agrees with the subject in the engine.
    if (concept.role !== "noun") clearNounPhraseParts(next, slot as NounKey);
    if (concept.role === "adjective")
      delete next[`${slot}Number` as keyof PhraseSelection];
  }
  // A standard survives its head changing between an adjective and a noun: another adjective takes it
  // over ("bigger than the dog" → "older than the dog"), and so does a noun's compared adjective ("a
  // bigger animal than the dog", P09-E50 D3). A pronoun takes no adjective, so it drops it.
  if (concept.role === "pronoun" && (slot === "subject" || slot === "directObject" || COMPLEMENT_KEY_SET.has(slot)))
    delete next[STANDARD_KEY(slot as NounKey)];
  if (opts?.number !== undefined)
    (next as PhraseSelection)[`${slot}Number` as keyof PhraseSelection] = opts.number as never;
  if (opts?.gender !== undefined)
    (next as PhraseSelection)[`${slot}Gender` as keyof PhraseSelection] = opts.gender as never;
  return next;
}

// Pure state transform: clear `slot` and every dependent satellite/adjective that
// only made sense while `slot` was filled.
export function applyClear(
  prev: PhraseSelection,
  slot: SlotKey,
): PhraseSelection {
  const next = { ...prev };
  delete next[slot];
  // A cleared word's own keyed settings go with it (an adjective's degree, a noun-modifier's relation).
  clearSlotSettings(next, [slot]);
  // Clearing a modal clears its own adverb and its own polarity (both controls live on the
  // modal's box, so neither survives it).
  const clearedModalAdverb = modalAdverbFor(slot);
  if (clearedModalAdverb) delete next[clearedModalAdverb as keyof PhraseSelection];
  const clearedModalNegative = modalNegativeFor(slot);
  if (clearedModalNegative) delete next[clearedModalNegative as keyof PhraseSelection];
  if (slot === "verb") {
    clearNoun(next, "directObject");
    clearAdjectives(next, "subject");
    for (const type of BOX_COMPLEMENT_TYPES) clearNoun(next, type);
  }
  if (slot === "subject" || slot === "directObject" || COMPLEMENT_KEY_SET.has(slot))
    clearNoun(next, slot as NounKey);
  // Clearing an adjective drops the ones chained after it — their reveal controls
  // ride the box that just went away. Modals chain off the verb the same way.
  for (const which of NOUN_KEYS) clearChainedAdjectives(next, which, slot);
  clearChainedModals(next, slot);
  return next;
}

// ── Toggles & cycles ─────────────────────────────────────────────────────────
// One pure `(prev) => next` transform per grammatical control on the canvas. Each is
// wrapped in `onPhraseUpdate` by the builder; none touches anything but the selection.

/**
 * Which value comes next in a cycle. `step` is +1 for the control's own click and −1 for the
 * keyboard's ⇧ (see the keymap: a key that cycles a value runs it backwards with ⇧), so a user
 * who has gone one value too far steps back rather than round.
 */
export type CycleStep = 1 | -1;

function cycled<V>(values: readonly V[], current: V, step: CycleStep): V {
  const idx = values.indexOf(current);
  return values[(idx + step + values.length) % values.length];
}

// ── Set a value ──────────────────────────────────────────────────────────────
// Each control's value, set outright. The console's settings set rather than toggle, so a typed line
// means the same whatever the period held before it (see console/language); the canvas's toggles and
// cycles below are these, fed the value after the current one.

export type Gender = "masc" | "fem" | "neut";

export function setNumber(
  prev: PhraseSelection,
  which: NumberSlot,
  value: "singular" | "plural",
): PhraseSelection {
  return { ...prev, [`${which}Number`]: value };
}

/**
 * The genders a noun block's head offers: every pronoun carries masculine and feminine, and only the
 * 3rd person adds neuter (he/she/it); a gendered noun has the two.
 */
export function gendersOf(prev: PhraseSelection, which: GenderSlot): Gender[] {
  const concept = prev[which] as Concept | undefined;
  return concept?.role === "pronoun" && concept.person === "3"
    ? ["masc", "fem", "neut"]
    : ["masc", "fem"];
}

export function setGender(
  prev: PhraseSelection,
  which: GenderSlot,
  value: Gender,
): PhraseSelection {
  return { ...prev, [`${which}Gender`]: value };
}

// Set the polarity of one word of the verb group: the main verb's (`verbNegative`, the default)
// or a modal's own (`verbModalNegative` / `verbModal2Negative`). Each denies the word its control
// is drawn on — "I do not want to not go" is both of them set.
export function setNegative(
  prev: PhraseSelection,
  value: boolean,
  field: NegativeField = "verbNegative",
): PhraseSelection {
  return { ...prev, [field]: value };
}

export function setTense(prev: PhraseSelection, value: Tense): PhraseSelection {
  return { ...prev, verbTense: value };
}

export function setAspect(prev: PhraseSelection, value: Aspect): PhraseSelection {
  return { ...prev, verbAspect: value };
}

export function setVoice(prev: PhraseSelection, value: Voice): PhraseSelection {
  return { ...prev, verbVoice: value };
}

// A real adjective's comparative degree, stored per slot key in `adjectiveDegrees` — for an
// adjective slot, or for the `predicative` slot holding a predicate adjective.
export function setDegree(prev: PhraseSelection, slotKey: SlotKey, value: Degree): PhraseSelection {
  return { ...prev, adjectiveDegrees: { ...prev.adjectiveDegrees, [slotKey]: value } };
}

// A noun-modifier's semantic relation, stored per adjective slot key in `modifierRelations`.
export function setModifierRelation(
  prev: PhraseSelection,
  slotKey: SlotKey,
  value: ModifierRelation,
): PhraseSelection {
  return { ...prev, modifierRelations: { ...prev.modifierRelations, [slotKey]: value } };
}

// A noun-modifier's own grammatical number, stored per adjective slot key in `modifierNumbers`.
export function setModifierNumber(
  prev: PhraseSelection,
  slotKey: SlotKey,
  value: "singular" | "plural",
): PhraseSelection {
  return { ...prev, modifierNumbers: { ...prev.modifierNumbers, [slotKey]: value } };
}

// The conjunction joining a noun block's group — one of the two that join noun phrases.
export function setNounConjunction(
  prev: PhraseSelection,
  which: NounKey,
  value: CoordConjunction,
): PhraseSelection {
  const next: PhraseSelection = { ...prev, [CONJUNCTION_KEY(which)]: value };
  // The correlative spells "and" alone (P09-E46).
  return value === "and" ? next : setCorrelative(next, which, false);
}

/** Whether a noun block's group is a pair joined by "and", the one group a correlative spells. */
function isAndPair(prev: PhraseSelection, which: NounKey): boolean {
  return conjunctsOf(prev, which).length === 1 && conjunctionOf(prev, which) === "and";
}

// Spell a noun block's "and" pair with its correlative, "both … and" (P09-E46), or take that back. A
// group that is not such a pair takes none, so turning it on there changes nothing.
export function setCorrelative(prev: PhraseSelection, which: NounKey, on: boolean): PhraseSelection {
  if (on && !isAndPair(prev, which)) return prev;
  if (Boolean(prev.correlatives?.[which]) === on) return prev;
  const next: PhraseSelection = { ...prev };
  if (on) next.correlatives = { ...prev.correlatives, [which]: true };
  else dropCorrelative(next, which);
  return next;
}

// Drop a block's correlative flag in place, and the map with the last of them.
function dropCorrelative(sel: PhraseSelection, which: NounKey): void {
  if (!sel.correlatives?.[which]) return;
  const { [which]: _dropped, ...rest } = sel.correlatives;
  if (Object.keys(rest).length > 0) sel.correlatives = rest;
  else delete sel.correlatives;
}

export function toggleNumber(
  prev: PhraseSelection,
  which: NumberSlot,
): PhraseSelection {
  return setNumber(prev, which, prev[`${which}Number`] === "plural" ? "singular" : "plural");
}

export function toggleGender(
  prev: PhraseSelection,
  which: GenderSlot,
  step: CycleStep = 1,
): PhraseSelection {
  const cur = (prev[`${which}Gender`] as Gender | undefined) ?? "masc";
  return setGender(prev, which, cycled(gendersOf(prev, which), cur, step));
}

export function toggleNegative(
  prev: PhraseSelection,
  field: NegativeField = "verbNegative",
): PhraseSelection {
  return setNegative(prev, !prev[field], field);
}

// Set a noun's determiner to a value picked from the menu. Ten values across three semantic
// dimensions is too many to cycle blindly, so the box opens a grouped menu instead.
export function setDefiniteness(
  prev: PhraseSelection,
  which: NounKey,
  value: Definiteness,
): PhraseSelection {
  const next: PhraseSelection = { ...prev, [`${which}Definiteness`]: value };
  // A contrast is the demonstratives' alone (P13).
  const contrasted = value === "this" || value === "that" ? next : setContrastive(next, which, false);
  // An approximator needs a quantity that takes one (P09-E49).
  return keepApproximated(contrasted, which);
}

// Approximate a noun's quantity (P09-E49), or take that back. A quantity that takes no approximator
// takes none, so turning it on there changes nothing.
export function setApproximated(prev: PhraseSelection, which: NounKey, on: boolean): PhraseSelection {
  if (on && !approximatorFor(prev, which)) return prev;
  if (Boolean(prev.approximators?.[which]) === on) return prev;
  const { [which]: _old, ...others } = prev.approximators ?? {};
  const approximators: Partial<Record<string, true>> = on ? { ...others, [which]: true } : others;
  const next: PhraseSelection = { ...prev, approximators };
  if (Object.keys(approximators).length === 0) delete next.approximators;
  return next;
}

// Drop the approximator once the quantity under it takes none: moving between licensed quantities
// keeps it (about five → all is almost all).
function keepApproximated(sel: PhraseSelection, which: NounKey): PhraseSelection {
  return approximatorFor(sel, which) ? sel : setApproximated(sel, which, false);
}

// Point a *this* / *that* determiner at one of a set, away from the rest (P13), or take that back.
export function setContrastive(prev: PhraseSelection, which: NounKey, contrastive: boolean): PhraseSelection {
  if (Boolean(prev.contrastives?.[which]) === contrastive) return prev;
  const { [which]: _old, ...others } = prev.contrastives ?? {};
  const contrastives = contrastive ? { ...others, [which]: true } : others;
  const next: PhraseSelection = { ...prev, contrastives };
  if (Object.keys(contrastives).length === 0) delete next.contrastives;
  return next;
}

// Cycle a noun-modifier's semantic relation (feature → purpose → material → feature),
// stored per adjective slot key in `modifierRelations`. Only meaningful when that slot
// holds a noun; ignored otherwise.
export function cycleModifierRelation(
  prev: PhraseSelection,
  slotKey: SlotKey,
  step: CycleStep = 1,
): PhraseSelection {
  const cur = prev.modifierRelations?.[slotKey] ?? "feature";
  return setModifierRelation(prev, slotKey, cycled(MODIFIER_RELATIONS, cur, step));
}

// Toggle a noun-modifier's own grammatical number (singular ⇄ plural), stored per adjective
// slot key in `modifierNumbers`. Only meaningful when that slot holds a noun.
export function cycleModifierNumber(
  prev: PhraseSelection,
  slotKey: SlotKey,
): PhraseSelection {
  const cur = prev.modifierNumbers?.[slotKey] ?? "singular";
  return setModifierNumber(prev, slotKey, cur === "singular" ? "plural" : "singular");
}

// Set (or, with `concept: undefined`, clear) the adjective modifying a noun-modifier itself,
// stored per adjective slot key in `modifierAdjectives`. Only meaningful when that slot holds
// a noun ("semantic *phrase* creator").
export function setModifierAdjective(
  prev: PhraseSelection,
  slotKey: SlotKey,
  concept: Concept | undefined,
): PhraseSelection {
  const modifierAdjectives = { ...prev.modifierAdjectives };
  if (concept) modifierAdjectives[slotKey] = concept;
  else delete modifierAdjectives[slotKey];
  return { ...prev, modifierAdjectives };
}

// Cycle a real adjective's comparative degree (positive → more → most → less → least →
// equally → positive), stored per slot key in `adjectiveDegrees` — for an adjective slot
// or for the `predicative` slot holding a predicate adjective. Only meaningful when that
// slot holds an adjective; ignored otherwise.
export function cycleDegree(
  prev: PhraseSelection,
  slotKey: SlotKey,
  step: CycleStep = 1,
): PhraseSelection {
  const cur = prev.adjectiveDegrees?.[slotKey] ?? "positive";
  return setDegree(prev, slotKey, cycled(DEGREES, cur, step));
}

// Set imperative (command) mood on this period, or take it off. Turning it on forces the verb into
// the present tense, neutral aspect and clears any modals — an imperative is a mood, so it can't
// carry a tense/aspect/modal, and it's mutually exclusive with a conditional / coordination (the
// UI gates those). The addressee defaults to 2sg. Turning it off leaves everything else intact,
// including the user's own subject pick (which selectionToPlan restores). Setting the mood a period
// already has changes nothing.
export function setImperative(prev: PhraseSelection, value: boolean): PhraseSelection {
  if (Boolean(prev.imperative) === value) return prev;
  if (!value) {
    return { ...prev, imperative: false };
  }
  return {
    ...prev,
    imperative: true,
    // Imperative and infinitive both occupy the finite/mood slot, so turning one on turns the
    // other off — and a command is not a question either (see setInterrogative).
    infinitive: false,
    ...unasked(prev),
    imperativePerson: prev.imperativePerson ?? "2sg",
    verbTense: "present",
    verbAspect: "neutral",
    // A command tells the addressee to act, so it is always active (see the translator's
    // `resolveVoice`, which normalises one either way).
    verbVoice: "active",
    verbModal: undefined,
    verbModal2: undefined,
    verbModalAdverb: undefined,
    verbModal2Adverb: undefined,
    verbModalNegative: undefined,
    verbModal2Negative: undefined,
  };
}

export function toggleImperative(prev: PhraseSelection): PhraseSelection {
  return setImperative(prev, !prev.imperative);
}

// Set the infinitive / citation render mode on this period, or take it off. Like the imperative it
// is a mood occupying the finite slot, so turning it on forces present tense / neutral aspect / no
// modals, drops the (throwaway) subject, and is mutually exclusive with the imperative and with a
// conditional / coordination (the UI gates those). Unlike the imperative it takes no person or
// register — a citation addresses nobody. Turning it off leaves everything else intact.
export function setInfinitive(prev: PhraseSelection, value: boolean): PhraseSelection {
  if (Boolean(prev.infinitive) === value) return prev;
  if (!value) {
    return { ...prev, infinitive: false };
  }
  return {
    ...prev,
    infinitive: true,
    imperative: false,
    ...unasked(prev),
    verbTense: "present",
    verbAspect: "neutral",
    verbModal: undefined,
    verbModal2: undefined,
    verbModalAdverb: undefined,
    verbModal2Adverb: undefined,
    verbModalNegative: undefined,
    verbModal2Negative: undefined,
  };
}

export function toggleInfinitive(prev: PhraseSelection): PhraseSelection {
  return setInfinitive(prev, !prev.infinitive);
}

// What a period that stops being a question drops: the force, the slot it asked about and that
// slot's who / what.
const NOT_A_QUESTION = {
  interrogative: false,
  questionRole: undefined,
  questionPossessed: undefined,
  questionAnimate: undefined,
} as const;

// The same, as the fields to spread over `prev` — none at all when it was no question, so a mood
// change leaves a statement's selection exactly as it was.
const unasked = (prev: PhraseSelection) =>
  prev.interrogative || prev.questionRole || prev.questionAnimate !== undefined ? NOT_A_QUESTION : {};

// Make this period a question, or a statement again (P09-E12 M5). The third mood: turning it on turns
// the command and the infinitive off, since the engine drops a question under either, but it forces
// nothing else — a question keeps its tense, aspect, modals and voice ("did the cat have to go?").
// Turning it off takes the wh-question's gap with it (D7: turning the question off clears the mark).
export function setInterrogative(prev: PhraseSelection, value: boolean): PhraseSelection {
  if (Boolean(prev.interrogative) === value) return prev;
  if (!value) return { ...prev, ...NOT_A_QUESTION };
  return { ...setInfinitive(setImperative(prev, false), false), interrogative: true };
}

export function toggleInterrogative(prev: PhraseSelection): PhraseSelection {
  return setInterrogative(prev, !prev.interrogative);
}

// Mark the slot this period's wh-question asks about, or unmark it (P09-E12 M6). One per period, so
// marking one moves the mark; marking makes the period a question, which is what lights the border's
// toggle, and ends an existential, which has no wh-question. A who / what set on the old slot does
// not carry over to the new one. Unmarking takes the question with it, undoing the mark: the console
// prints a wh-question as its gap alone (`/wh obj`, no `/ask`), so a yes/no left behind would be a
// question the user never asked for.
//
// The owner's mark (P09-E52) names the noun it is inside too, the subject's owner by default: marking
// the object's owner moves the mark as marking another slot does.
export function setQuestionRole(
  prev: PhraseSelection,
  role: QuestionRole | undefined,
  possessed?: "subject" | "directObject",
): PhraseSelection {
  const owner = role === "possessor" ? possessed ?? "subject" : undefined;
  if (prev.questionRole === role && prev.questionPossessed === owner) return prev;
  if (!role) return { ...prev, ...NOT_A_QUESTION };
  const next: PhraseSelection = {
    ...setInterrogative(prev, true),
    questionRole: role,
    questionPossessed: owner,
    questionAnimate: undefined,
    existential: false,
  };
  if (!owner) delete next.questionPossessed;
  return next;
}

export function toggleQuestionRole(
  prev: PhraseSelection,
  role: QuestionRole,
  possessed?: "subject" | "directObject",
): PhraseSelection {
  const asked =
    prev.questionRole === role && (role !== "possessor" || (prev.questionPossessed ?? "subject") === (possessed ?? "subject"));
  return setQuestionRole(prev, asked ? undefined : role, possessed);
}

// Whether the marked subject or object question asks *who* (true) or *what* (false). Kept as the
// user's own choice once made; absent, the held word's `human` answers (see questionAnimateOf).
export function setQuestionAnimate(prev: PhraseSelection, value: boolean): PhraseSelection {
  if (prev.questionAnimate === value) return prev;
  return { ...prev, questionAnimate: value };
}

// The who / what chip: flip what the question asks now, default or chosen.
export function toggleQuestionAnimate(prev: PhraseSelection): PhraseSelection {
  return setQuestionAnimate(prev, !questionAnimateOf(prev));
}

// Make this period an existential, "there is a cat", or take it back (P09-E12 M7). Exclusive with a
// wh-question, which the engine does not build over an existential: turning one on unmarks the gap
// (the yes/no question stays — "is there a cat?").
export function setExistential(prev: PhraseSelection, value: boolean): PhraseSelection {
  if (Boolean(prev.existential) === value) return prev;
  if (!value) return { ...prev, existential: false };
  return { ...prev, existential: true, questionRole: undefined, questionPossessed: undefined, questionAnimate: undefined };
}

export function toggleExistential(prev: PhraseSelection): PhraseSelection {
  return setExistential(prev, !prev.existential);
}

// Say the verb in the humble register, the Japanese 謙譲語, or take it back (P11-E6). A plain flag: the
// plan builder decides whether it reaches the plan (see canBeHumble), so a subject or a verb that
// stops licensing it leaves it here for when they return.
export function setHumble(prev: PhraseSelection, value: boolean): PhraseSelection {
  if (Boolean(prev.verbHumble) === value) return prev;
  return { ...prev, verbHumble: value };
}

export function toggleHumble(prev: PhraseSelection): PhraseSelection {
  return setHumble(prev, !prev.verbHumble);
}

// Set the person the command's verb agrees with (2sg / 1pl "let's" / 2pl). Kept even under the
// `instruction` register, where it is moot: the selector greys the row rather than forgetting the
// pick, so switching back to an order restores it. No-op semantics off imperative, but harmless
// to store so the choice persists across a toggle.
export function setImperativePerson(
  prev: PhraseSelection,
  person: ImperativePerson,
): PhraseSelection {
  return { ...prev, imperativePerson: person };
}

// Set the register the command is spoken in: an order addressed to the person above (`request`,
// the default, stored as absent), or an impersonal instruction — what a button or a recipe step
// carries, which the engines render in each language's own label form.
export function setImperativeRegister(
  prev: PhraseSelection,
  register: ImperativeRegister,
): PhraseSelection {
  return {
    ...prev,
    imperativeRegister: register === "instruction" ? "instruction" : undefined,
  };
}

// Cycle the verb tense present → past → future → present.
export function cycleTense(prev: PhraseSelection, step: CycleStep = 1): PhraseSelection {
  return setTense(prev, cycled(TENSES, prev.verbTense ?? "present", step));
}

// Cycle the verb aspect neutral → progressive → prospective → resultative → neutral.
export function cycleAspect(prev: PhraseSelection, step: CycleStep = 1): PhraseSelection {
  return setAspect(prev, cycled(ASPECTS, prev.verbAspect ?? "neutral", step));
}

// Cycle the verb voice active → passive → active.
export function cycleVoice(prev: PhraseSelection, step: CycleStep = 1): PhraseSelection {
  return setVoice(prev, cycled(VOICES, prev.verbVoice ?? "active", step));
}

// Set a spatial complement's relation (through / under / over / …). Route and locative draw on
// the same relations but keep their own key, since their defaults differ (through vs in).
export function setSpecifier(
  prev: PhraseSelection,
  spec: PathSpecifier | undefined,
  which: "route" | "locative" | "direction" = "route",
): PhraseSelection {
  // The direction's plain goal has no relation to hold (P13): undefined takes it back there.
  if (which === "direction") {
    const next: PhraseSelection = { ...prev, directionSpecifier: spec };
    if (!spec) delete next.directionSpecifier;
    return next;
  }
  return which === "locative"
    ? { ...prev, locativeSpecifier: spec }
    : { ...prev, routeSpecifier: spec };
}

// Set the temporal complement's relation (at / ago / until / after / before / during, P09-E12b):
// its toolbar, as the route's path is. `at` is the default the plan omits (see buildComplements).
// The reading of a verbless period's subject (P13), or none. A relation belongs to the time
// reading alone, so another reading drops it.
export function setSubjectGloss(prev: PhraseSelection, gloss: NounGloss | undefined): PhraseSelection {
  const next: PhraseSelection = { ...prev, subjectGloss: gloss };
  if (!gloss) delete next.subjectGloss;
  if (gloss !== "temporal") delete next.subjectGlossRelation;
  return next;
}

// Cycle none → dimension → manner → place → direction → time → none.
export function cycleSubjectGloss(prev: PhraseSelection, step: CycleStep = 1): PhraseSelection {
  const values = [undefined, ...NOUN_GLOSSES] as const;
  return setSubjectGloss(prev, cycled(values, prev.subjectGloss, step));
}

// The relation a time reading says it with (P13): "until this time", "a moment ago".
export function setGlossRelation(prev: PhraseSelection, relation: TemporalRelation): PhraseSelection {
  const next: PhraseSelection = { ...prev, subjectGlossRelation: relation };
  if (relation === DEFAULT_TEMPORAL_RELATION) delete next.subjectGlossRelation;
  return next;
}

export function cycleGlossRelation(prev: PhraseSelection, step: CycleStep = 1): PhraseSelection {
  return setGlossRelation(prev, cycled(TEMPORAL_RELATIONS, prev.subjectGlossRelation ?? DEFAULT_TEMPORAL_RELATION, step));
}

export function setTemporalRelation(
  prev: PhraseSelection,
  relation: TemporalRelation,
): PhraseSelection {
  return { ...prev, temporalRelation: relation };
}

// What the object is taken as or turned into (P13): essive or factitive. The verb's own default is
// dropped rather than stored, so the box keeps following the verb.
export function setPredication(prev: PhraseSelection, predication: ObjectPredication): PhraseSelection {
  const next: PhraseSelection = { ...prev, objectPredicativePredication: predication };
  if (predication === defaultPredication(prev.verb)) delete next.objectPredicativePredication;
  return next;
}

// Deny the cause rather than name it: "not because of the dog". It is the complement's own
// negation, a separate axis from both the sentiment and the clause's `verbNegative`.
export function setCauseNegative(
  prev: PhraseSelection,
  value: boolean,
): PhraseSelection {
  return { ...prev, causeNegative: value };
}

export function toggleCauseNegative(prev: PhraseSelection): PhraseSelection {
  return setCauseNegative(prev, !prev.causeNegative);
}

// Set the cause complement's affective sentiment (neutral / negative / positive).
export function setSentiment(
  prev: PhraseSelection,
  sentiment: CauseSentiment,
): PhraseSelection {
  return { ...prev, causeSentiment: sentiment };
}


// Apply `updater` to the possessor slice hanging off `which`, seeding an empty possessor
// the first time. Lets a nested noun-phrase-mode builder's edits land inside
// `${which}Possessor` without knowing it is embedded.
export function updatePossessor(
  prev: PhraseSelection,
  which: NounKey,
  updater: (prev: PhraseSelection) => PhraseSelection,
): PhraseSelection {
  const next: PhraseSelection = {
    ...prev,
    [POSSESSOR_KEY(which)]: updater(
      (prev[POSSESSOR_KEY(which)] as PhraseSelection | undefined) ?? {},
    ),
  };
  // A genitive possessor and a pronominal reference are two ways to fill the one possessor slot,
  // so editing the genitive drops any reference that was there.
  delete next[POSSESSOR_REF_KEY(which)];
  return next;
}

// Remove a noun block's possessor entirely.
export function removePossessor(
  prev: PhraseSelection,
  which: NounKey,
): PhraseSelection {
  const next = { ...prev };
  delete next[POSSESSOR_KEY(which)];
  return dropPossessorRole(next, which);
}

// A cardinal numeral counting the noun (P13), or none: "24 hours".
export function setNumeral(prev: PhraseSelection, which: NounKey, numeral: number | undefined): PhraseSelection {
  const { [which]: _old, ...others } = prev.numerals ?? {};
  const numerals = numeral === undefined ? others : { ...others, [which]: numeral };
  const next: PhraseSelection = { ...prev, numerals };
  if (Object.keys(numerals).length === 0) delete next.numerals;
  return keepApproximated(next, which);
}

// What a noun's genitive possessor is to it (P13): the whole it is part of, the parts it is made of,
// or — undefined — its owner.
export function setPossessorRole(prev: PhraseSelection, which: NounKey, role: PossessorRole | undefined): PhraseSelection {
  if (!role) return dropPossessorRole(prev, which);
  return { ...prev, possessorRoles: { ...prev.possessorRoles, [which]: role } };
}

// Cycle owner → whole → parts → owner.
export function cyclePossessorRole(prev: PhraseSelection, which: NounKey, step: CycleStep = 1): PhraseSelection {
  return setPossessorRole(prev, which, cycled([undefined, ...POSSESSOR_ROLES] as const, prev.possessorRoles?.[which], step));
}

// The role goes with the genitive possessor it describes: a pronominal one ("its part") has none.
function dropPossessorRole(prev: PhraseSelection, which: NounKey): PhraseSelection {
  if (!prev.possessorRoles?.[which]) return prev;
  const { [which]: _dropped, ...rest } = prev.possessorRoles;
  const next: PhraseSelection = { ...prev, possessorRoles: rest };
  if (Object.keys(rest).length === 0) delete next.possessorRoles;
  return next;
}

// Apply `updater` to the standard of comparison hanging off `which` (the predicate adjective,
// P09-E12 D5), seeding an empty one the first time — the lens `updatePossessor` gives an owner.
export function updateStandard(
  prev: PhraseSelection,
  which: NounKey,
  updater: (prev: PhraseSelection) => PhraseSelection,
): PhraseSelection {
  return {
    ...prev,
    [STANDARD_KEY(which)]: updater((prev[STANDARD_KEY(which)] as PhraseSelection | undefined) ?? {}),
  };
}

// Remove a noun block's standard of comparison entirely.
export function removeStandard(prev: PhraseSelection, which: NounKey): PhraseSelection {
  const next = { ...prev };
  delete next[STANDARD_KEY(which)];
  return next;
}

// Apply `updater` to the examples of `which` ("animals such as the cat", P09-E48), seeding an empty
// phrase the first time — the lens `updatePossessor` gives an owner.
export function updateExamples(
  prev: PhraseSelection,
  which: NounKey,
  updater: (prev: PhraseSelection) => PhraseSelection,
): PhraseSelection {
  return {
    ...prev,
    [EXAMPLES_KEY(which)]: updater((prev[EXAMPLES_KEY(which)] as PhraseSelection | undefined) ?? {}),
  };
}

// Remove a noun block's examples entirely, and the relation they were given.
export function removeExamples(prev: PhraseSelection, which: NounKey): PhraseSelection {
  const next = setExampleRelation(prev, which, "example");
  delete next[EXAMPLES_KEY(which)];
  return next;
}

// Set how a noun block's examples relate to it: *such as* (`example`, the default, left unstored)
// or *including* (`inclusion`).
export function setExampleRelation(prev: PhraseSelection, which: NounKey, relation: "example" | "inclusion"): PhraseSelection {
  if (relation === "inclusion") return { ...prev, exampleRelations: { ...prev.exampleRelations, [which]: "inclusion" } };
  if (!prev.exampleRelations?.[which]) return { ...prev };
  const { [which]: _dropped, ...rest } = prev.exampleRelations;
  const next: PhraseSelection = { ...prev, exampleRelations: rest };
  if (Object.keys(rest).length === 0) delete next.exampleRelations;
  return next;
}

// Flip such as ⇄ including — what the chip on the examples line does.
export function toggleExampleRelation(prev: PhraseSelection, which: NounKey): PhraseSelection {
  return setExampleRelation(prev, which, prev.exampleRelations?.[which] ? "example" : "inclusion");
}

// The antecedent a noun block's pronominal possessor points at, if any ("the boy and *his* horse").
export function possessorRefOf(prev: PhraseSelection, which: NounKey): NounAddress | undefined {
  return prev[POSSESSOR_REF_KEY(which)] as NounAddress | undefined;
}

// Point a noun block's possessor at an antecedent noun (a pronominal possessor), clearing any
// genitive possessor — the two share the one slot.
export function setPossessorRef(
  prev: PhraseSelection,
  which: NounKey,
  address: NounAddress,
): PhraseSelection {
  const next: PhraseSelection = { ...prev, [POSSESSOR_REF_KEY(which)]: address };
  delete next[POSSESSOR_KEY(which)];
  return dropPossessorRole(next, which);
}

// Remove a noun block's pronominal possessor reference.
export function clearPossessorRef(
  prev: PhraseSelection,
  which: NounKey,
): PhraseSelection {
  const next = { ...prev };
  delete next[POSSESSOR_REF_KEY(which)];
  return next;
}

/** The extra conjuncts coordinated with a noun block's own head (empty when it has none). */
export function conjunctsOf(prev: PhraseSelection, which: NounKey): PhraseSelection[] {
  return (prev[CONJUNCTS_KEY(which)] as PhraseSelection[] | undefined) ?? [];
}

/** The conjunction joining a noun block's group. Defaults to the copulative. */
export function conjunctionOf(prev: PhraseSelection, which: NounKey): CoordConjunction {
  return (prev[CONJUNCTION_KEY(which)] as CoordConjunction | undefined) ?? "and";
}

// Append an empty conjunct to a noun block, coordinating it with the block's own head.
export function addConjunct(prev: PhraseSelection, which: NounKey): PhraseSelection {
  // A third conjunct makes the group no pair, which a correlative spells alone (P09-E46).
  return setCorrelative({ ...prev, [CONJUNCTS_KEY(which)]: [...conjunctsOf(prev, which), {}] }, which, false);
}

// Apply `updater` to the i-th conjunct of `which`. Lets the nested noun-phrase-mode builder
// editing that conjunct write into `${which}Conjuncts[i]` without knowing it is embedded —
// the same lens `updatePossessor` gives an owner's builder.
export function updateConjunct(
  prev: PhraseSelection,
  which: NounKey,
  i: number,
  updater: (prev: PhraseSelection) => PhraseSelection,
): PhraseSelection {
  const conjuncts = conjunctsOf(prev, which);
  return {
    ...prev,
    [CONJUNCTS_KEY(which)]: conjuncts.map((c, j) => (j === i ? updater(c ?? {}) : c)),
  };
}

// Drop the i-th conjunct. The last one out takes the conjunction with it — a block with no
// conjuncts is not a coordination, and leaving a stale conjunction behind would resurrect
// itself the next time one is added.
export function removeConjunct(
  prev: PhraseSelection,
  which: NounKey,
  i: number,
): PhraseSelection {
  const conjuncts = conjunctsOf(prev, which).filter((_, j) => j !== i);
  const next = { ...prev, [CONJUNCTS_KEY(which)]: conjuncts };
  if (conjuncts.length === 0) {
    delete next[CONJUNCTS_KEY(which)];
    delete next[CONJUNCTION_KEY(which)];
  }
  // A removal ends the pair the correlative spelled (P09-E46), or leaves no group at all.
  dropCorrelative(next, which);
  // The conjuncts after it move up one, and an address is positional: a possessor that pointed at the
  // removed conjunct, or at one after it, would now name another noun — its own, even. It is dropped,
  // as the workspace drops the relative links sourced there (see handleRemoveConjunct).
  const moved = (address: string) => {
    const m = address.match(new RegExp(`^${which}/conjunct/(\\d+)(/|$)`));
    return m !== null && Number(m[1]) >= i;
  };
  return dropPossessorRefs(next, moved);
}

/** A selection with every pronominal possessor, at any depth, that points at an address `drop` names cleared. */
function dropPossessorRefs(sel: PhraseSelection, drop: (address: string) => boolean): PhraseSelection {
  let out = sel;
  for (const [key, value] of Object.entries(sel)) {
    const set = (v: unknown) => {
      if (out === sel) out = { ...sel };
      (out as Record<string, unknown>)[key] = v;
    };
    if (key.endsWith("PossessorRef") && typeof value === "string" && drop(value)) {
      if (out === sel) out = { ...sel };
      delete (out as Record<string, unknown>)[key];
    } else if ((key.endsWith("Possessor") || key.endsWith("Standard")) && value && typeof value === "object" && !Array.isArray(value)) {
      const inner = dropPossessorRefs(value as PhraseSelection, drop);
      if (inner !== value) set(inner);
    } else if (key.endsWith("Conjuncts") && Array.isArray(value)) {
      const inner = (value as PhraseSelection[]).map((c) => dropPossessorRefs(c, drop));
      if (inner.some((c, j) => c !== value[j])) set(inner);
    }
  }
  return out;
}

// Cycle a block's conjunction through the ones that may join noun phrases (and / or). A pair joined by
// "and" passes through its correlative on the way (P09-E46): and → both … and → or → and.
export function cycleNounConjunction(
  prev: PhraseSelection,
  which: NounKey,
): PhraseSelection {
  if (isAndPair(prev, which) && !prev.correlatives?.[which]) return setCorrelative(prev, which, true);
  const current = conjunctionOf(prev, which);
  const i = NOUN_COORD_CONJUNCTIONS.indexOf(current);
  return setNounConjunction(prev, which, NOUN_COORD_CONJUNCTIONS[(i + 1) % NOUN_COORD_CONJUNCTIONS.length]);
}

// ── Addressed edits ──
// A period's nouns nest: a possessor, a conjunct or a standard of comparison is a phrase slice of
// its own, whose head is its `subject`. A `NounAddress` names any of them from the period root (see
// interfaces.ts), so these let the root builder read and edit the slice that holds a noun, however
// deep it sits.

/**
 * The slice holding the noun at `address`, and that noun's key within it: the period itself for a
 * top-level noun, else the nested slice whose `subject` the noun is. Undefined when a step along
 * the way is missing.
 */
export function nounSliceAt(
  root: PhraseSelection,
  address: NounAddress,
): { slice: PhraseSelection; which: NounKey } | undefined {
  const [base, ...steps] = address.split("/");
  let slice = root;
  let which = base as NounKey;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i] === "possessor") {
      const child = slice[POSSESSOR_KEY(which)] as PhraseSelection | undefined;
      if (!child) return undefined;
      slice = child;
    } else if (steps[i] === "conjunct") {
      const child = conjunctsOf(slice, which)[Number(steps[++i])];
      if (!child) return undefined;
      slice = child;
    } else if (steps[i] === "standard") {
      const child = slice[STANDARD_KEY(which)] as PhraseSelection | undefined;
      if (!child) return undefined;
      slice = child;
    } else if (steps[i] === "examples") {
      const child = slice[EXAMPLES_KEY(which)] as PhraseSelection | undefined;
      if (!child) return undefined;
      slice = child;
    } else {
      return undefined;
    }
    which = "subject";
  }
  return { slice, which };
}

/**
 * Apply `fn` to the slice holding the noun at `address` (see nounSliceAt), seeding any possessor
 * slice on the way — the same lens `updatePossessor` and `updateConjunct` give one level down.
 */
export function updateNounAt(
  root: PhraseSelection,
  address: NounAddress,
  fn: (slice: PhraseSelection, which: NounKey) => PhraseSelection,
): PhraseSelection {
  const [base, ...steps] = address.split("/");
  const walk = (slice: PhraseSelection, which: NounKey, i: number): PhraseSelection => {
    if (i >= steps.length) return fn(slice, which);
    if (steps[i] === "possessor")
      return updatePossessor(slice, which, (child) => walk(child, "subject", i + 1));
    if (steps[i] === "conjunct")
      return updateConjunct(slice, which, Number(steps[i + 1]), (child) => walk(child, "subject", i + 2));
    if (steps[i] === "standard")
      return updateStandard(slice, which, (child) => walk(child, "subject", i + 1));
    if (steps[i] === "examples")
      return updateExamples(slice, which, (child) => walk(child, "subject", i + 1));
    return slice;
  };
  return walk(root, base as NounKey, 0);
}
