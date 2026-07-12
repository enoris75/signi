import {
  ASPECTS,
  DEGREES,
  MODIFIER_RELATIONS,
  TENSES,
  type CauseSentiment,
  type Concept,
  type Definiteness,
  type ImperativeRegister,
  type PathSpecifier,
} from "@signi/shared";
import {
  GenderSlot,
  ImperativePerson,
  NounKey,
  NumberSlot,
  PhraseSelection,
  POSSESSOR_KEY,
  SlotKey,
} from "./interfaces.ts";
import {
  adjectiveSlots,
  BOX_COMPLEMENT_TYPES,
  COMPLEMENT_KEY_SET,
  getActiveSlots,
  MODAL_SLOTS,
  NOUN_KEYS,
} from "./slots.ts";

// Drop every adjective of a noun block — the whole chain, since a later link is
// meaningless without the earlier ones.
function clearAdjectives(sel: PhraseSelection, which: NounKey): void {
  for (const key of adjectiveSlots(which))
    delete sel[key as keyof PhraseSelection];
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
  for (const key of chain.slice(idx + 1))
    delete sel[key as keyof PhraseSelection];
}

// Drop the modals chained *after* `slot` — same reasoning as the adjectives: the control
// that reveals a governed modal rides its governor's box, so it goes when that box does.
// `slot` may be the verb, which clears the whole chain (a modal with no verb to govern is
// meaningless), a modal, or anything else (a no-op).
function clearChainedModals(sel: PhraseSelection, slot: SlotKey): void {
  const idx = MODAL_SLOTS.indexOf(slot);
  if (idx === -1 && slot !== "verb") return;
  for (const key of MODAL_SLOTS.slice(idx + 1))
    delete sel[key as keyof PhraseSelection];
}

// Pure state transform: place `concept` into `slot`, cascading the side effects
// that keep the selection internally consistent (dropping now-invalid dependents,
// seeding default gender/number, clearing chained adjectives, etc.).
export function applyConceptSelect(
  prev: PhraseSelection,
  slot: SlotKey,
  concept: Concept,
): PhraseSelection {
  const next = { ...prev, [slot]: concept };
  if (slot === "verb") {
    const nowVisible = getActiveSlots(
      concept.transitivity,
      prev.subject?.role,
      Boolean(prev.subjectAdjective),
      concept.complements,
    ).map((s) => s.key);
    if (!nowVisible.includes("directObject")) {
      delete next.directObject;
      delete next.directObjectNumber;
      clearAdjectives(next, "directObject");
    }
    if (!nowVisible.includes("subjectAdjective")) clearAdjectives(next, "subject");
    // Drop complements the new verb no longer licenses.
    for (const type of BOX_COMPLEMENT_TYPES) {
      if (!nowVisible.includes(type)) {
        delete next[type];
        delete next[`${type}Number`];
        delete next[`${type}Gender`];
        clearAdjectives(next, type);
        if (type === "route") delete next.routeSpecifier;
        if (type === "cause") delete next.causeSentiment;
      }
    }
  }
  if (slot === "subject") {
    clearAdjectives(next, "subject");
    if (concept.role === "pronoun") {
      next.subjectNumber = "singular";
      // Gender applies to every pronoun person (participle/adjective agreement in Romance);
      // neuter is 3rd-person only, so clamp a stale 'neut' when switching to 1st/2nd.
      const g = prev.subjectGender ?? "masc";
      next.subjectGender = concept.person !== "3" && g === "neut" ? "masc" : g;
    } else if (concept.role === "noun") {
      if (concept.gendered) {
        next.subjectGender = prev.subjectGender ?? "masc";
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
    if (concept.gendered) {
      next.directObjectGender = prev.directObjectGender ?? "masc";
    } else {
      delete next.directObjectGender;
    }
  }
  if (COMPLEMENT_KEY_SET.has(slot)) {
    // Swapping the complement noun invalidates its adjectives.
    clearAdjectives(next, slot as NounKey);
    const gKey = `${slot}Gender` as keyof PhraseSelection;
    if (concept.gendered) {
      (next[gKey] as "masc" | "fem") =
        (prev[gKey] as "masc" | "fem") ?? "masc";
    } else {
      delete next[gKey];
    }
    // Only a noun head is a full noun phrase. A predicate adjective ("seems happy") and a
    // pronoun cause ("because of her") take no article and no possessor; the adjective
    // additionally carries no number of its own — it agrees with the subject in the engine.
    if (concept.role !== "noun") {
      delete next[`${slot}Definiteness` as keyof PhraseSelection];
      delete next[POSSESSOR_KEY(slot as NounKey)];
    }
    if (concept.role === "adjective")
      delete next[`${slot}Number` as keyof PhraseSelection];
  }
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
  if (slot === "verb") {
    delete next.directObject;
    delete next.directObjectNumber;
    delete next.directObjectGender;
    clearAdjectives(next, "directObject");
    clearAdjectives(next, "subject");
    for (const type of BOX_COMPLEMENT_TYPES) {
      delete next[type];
      delete next[`${type}Number`];
      delete next[`${type}Gender`];
      clearAdjectives(next, type);
    }
    delete next.routeSpecifier;
    delete next.causeSentiment;
  }
  if (slot === "subject") {
    clearAdjectives(next, "subject");
    delete next.subjectNumber;
    delete next.subjectGender;
  }
  if (slot === "directObject") {
    delete next.directObjectNumber;
    delete next.directObjectGender;
    clearAdjectives(next, "directObject");
  }
  if (COMPLEMENT_KEY_SET.has(slot)) {
    delete next[`${slot}Number` as keyof PhraseSelection];
    delete next[`${slot}Gender` as keyof PhraseSelection];
    clearAdjectives(next, slot as NounKey);
    if (slot === "route") delete next.routeSpecifier;
    if (slot === "cause") delete next.causeSentiment;
  }
  // Clearing an adjective drops the ones chained after it — their reveal controls
  // ride the box that just went away. Modals chain off the verb the same way.
  for (const which of NOUN_KEYS) clearChainedAdjectives(next, which, slot);
  clearChainedModals(next, slot);
  return next;
}

// ── Toggles & cycles ─────────────────────────────────────────────────────────
// One pure `(prev) => next` transform per grammatical control on the canvas. Each is
// wrapped in `onPhraseUpdate` by the builder; none touches anything but the selection.

export function toggleNumber(
  prev: PhraseSelection,
  which: NumberSlot,
): PhraseSelection {
  const key = `${which}Number` as keyof PhraseSelection;
  return { ...prev, [key]: prev[key] === "plural" ? "singular" : "plural" };
}

export function toggleGender(
  prev: PhraseSelection,
  which: GenderSlot,
): PhraseSelection {
  const key = `${which}Gender` as keyof PhraseSelection;
  // Every pronoun carries gender (masc/fem); only the 3rd person adds neuter (he/she/it).
  const concept = prev[which] as Concept | undefined;
  const cycle: ("masc" | "fem" | "neut")[] =
    concept?.role === "pronoun" && concept.person === "3"
      ? ["masc", "fem", "neut"]
      : ["masc", "fem"];
  const cur = (prev[key] as "masc" | "fem" | "neut") ?? "masc";
  const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length];
  return { ...prev, [key]: next };
}

export function toggleNegative(prev: PhraseSelection): PhraseSelection {
  return { ...prev, verbNegative: !prev.verbNegative };
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
): PhraseSelection {
  const cur = prev.modifierRelations?.[slotKey] ?? "feature";
  const next =
    MODIFIER_RELATIONS[
      (MODIFIER_RELATIONS.indexOf(cur) + 1) % MODIFIER_RELATIONS.length
    ];
  return {
    ...prev,
    modifierRelations: { ...prev.modifierRelations, [slotKey]: next },
  };
}

// Toggle a noun-modifier's own grammatical number (singular ⇄ plural), stored per adjective
// slot key in `modifierNumbers`. Only meaningful when that slot holds a noun.
export function cycleModifierNumber(
  prev: PhraseSelection,
  slotKey: SlotKey,
): PhraseSelection {
  const cur = prev.modifierNumbers?.[slotKey] ?? "singular";
  const next = cur === "singular" ? "plural" : "singular";
  return {
    ...prev,
    modifierNumbers: { ...prev.modifierNumbers, [slotKey]: next },
  };
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
): PhraseSelection {
  const cur = prev.adjectiveDegrees?.[slotKey] ?? "positive";
  const next = DEGREES[(DEGREES.indexOf(cur) + 1) % DEGREES.length];
  return {
    ...prev,
    adjectiveDegrees: { ...prev.adjectiveDegrees, [slotKey]: next },
  };
}

// Toggle imperative (command) mood on this period. Turning it on forces the verb into the
// present tense, neutral aspect and clears any modals — an imperative is a mood, so it can't
// carry a tense/aspect/modal, and it's mutually exclusive with a conditional / coordination (the
// UI gates those). The addressee defaults to 2sg. Turning it off leaves everything else intact,
// including the user's own subject pick (which selectionToPlan restores).
export function toggleImperative(prev: PhraseSelection): PhraseSelection {
  if (prev.imperative) {
    return { ...prev, imperative: false };
  }
  return {
    ...prev,
    imperative: true,
    imperativePerson: prev.imperativePerson ?? "2sg",
    verbTense: "present",
    verbAspect: "neutral",
    verbModal: undefined,
    verbModal2: undefined,
  };
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
export function cycleTense(prev: PhraseSelection): PhraseSelection {
  const idx = TENSES.indexOf(prev.verbTense ?? "present");
  return { ...prev, verbTense: TENSES[(idx + 1) % TENSES.length] };
}

// Cycle the verb aspect neutral → progressive → prospective → resultative → neutral.
export function cycleAspect(prev: PhraseSelection): PhraseSelection {
  const idx = ASPECTS.indexOf(prev.verbAspect ?? "neutral");
  return { ...prev, verbAspect: ASPECTS[(idx + 1) % ASPECTS.length] };
}

// Set the route complement's path relation (through / under / over / …).
export function setSpecifier(
  prev: PhraseSelection,
  spec: PathSpecifier,
): PhraseSelection {
  return { ...prev, routeSpecifier: spec };
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
  return {
    ...prev,
    [POSSESSOR_KEY(which)]: updater(
      (prev[POSSESSOR_KEY(which)] as PhraseSelection | undefined) ?? {},
    ),
  };
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
