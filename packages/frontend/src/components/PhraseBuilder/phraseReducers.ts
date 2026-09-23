import {
  ASPECTS,
  DEGREES,
  MODIFIER_RELATIONS,
  NOUN_COORD_CONJUNCTIONS,
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
  type PathSpecifier,
  type Tense,
  type TemporalRelation,
  type Voice,
} from "@signi/shared";
import {
  CONJUNCTION_KEY,
  CONJUNCTS_KEY,
  ConceptSelectOpts,
  GenderSlot,
  ImperativePerson,
  NounAddress,
  NounKey,
  NumberSlot,
  PhraseSelection,
  POSSESSOR_KEY,
  POSSESSOR_REF_KEY,
  SlotKey,
} from "./interfaces.ts";
import type { ModalNegativeField } from "./slots.ts";
import {
  adjectiveSlots,
  BOX_COMPLEMENT_TYPES,
  COMPLEMENT_KEY_SET,
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
  if (which === "route") delete sel.routeSpecifier;
  if (which === "locative") delete sel.locativeSpecifier;
  if (which === "temporal") delete sel.temporalRelation;
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
  return { ...prev, [CONJUNCTION_KEY(which)]: value };
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
  return { ...prev, [`${which}Definiteness`]: value };
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
    // other off.
    infinitive: false,
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
  spec: PathSpecifier,
  which: "route" | "locative" = "route",
): PhraseSelection {
  return which === "locative"
    ? { ...prev, locativeSpecifier: spec }
    : { ...prev, routeSpecifier: spec };
}

// Set the temporal complement's relation (at / ago / until / after / before / during, P09-E12b):
// its toolbar, as the route's path is. `at` is the default the plan omits (see buildComplements).
export function setTemporalRelation(
  prev: PhraseSelection,
  relation: TemporalRelation,
): PhraseSelection {
  return { ...prev, temporalRelation: relation };
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
  return next;
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
  return next;
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
  return { ...prev, [CONJUNCTS_KEY(which)]: [...conjunctsOf(prev, which), {}] };
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
  return next;
}

// Cycle a block's conjunction through the ones that may join noun phrases (and / or).
export function cycleNounConjunction(
  prev: PhraseSelection,
  which: NounKey,
): PhraseSelection {
  const current = conjunctionOf(prev, which);
  const i = NOUN_COORD_CONJUNCTIONS.indexOf(current);
  return setNounConjunction(prev, which, NOUN_COORD_CONJUNCTIONS[(i + 1) % NOUN_COORD_CONJUNCTIONS.length]);
}

// ── Addressed edits ──
// A period's nouns nest: a possessor or a conjunct is a phrase slice of its own, whose head is its
// `subject`. A `NounAddress` names any of them from the period root (see interfaces.ts), so these let
// the root builder read and edit the slice that holds a noun, however deep it sits.

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
    return slice;
  };
  return walk(root, base as NounKey, 0);
}
