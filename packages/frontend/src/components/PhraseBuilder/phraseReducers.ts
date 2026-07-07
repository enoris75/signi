import { COMPLEMENT_TYPES, type Concept } from "@signi/shared";
import { PhraseSelection, SlotKey } from "./interfaces.ts";
import { COMPLEMENT_KEY_SET, getActiveSlots } from "./slots.ts";

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
      delete next.directObjectAdjective;
      delete next.directObjectAdjective2;
    }
    if (!nowVisible.includes("indirectObject")) {
      delete next.indirectObject;
      delete next.indirectObjectNumber;
      delete next.indirectObjectAdjective;
      delete next.indirectObjectAdjective2;
    }
    if (!nowVisible.includes("subjectAdjective")) delete next.subjectAdjective;
    // Drop complements the new verb no longer licenses.
    for (const type of COMPLEMENT_TYPES) {
      if (!nowVisible.includes(type)) {
        delete next[type];
        delete next[`${type}Number`];
        delete next[`${type}Gender`];
        delete next[`${type}Adjective`];
        delete next[`${type}Adjective2`];
        if (type === "route") delete next.routeSpecifier;
        if (type === "cause") delete next.causeSentiment;
      }
    }
  }
  if (slot === "subject") {
    delete next.subjectAdjective;
    delete next.subjectAdjective2;
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
    delete next.directObjectAdjective;
    delete next.directObjectAdjective2;
    if (concept.gendered) {
      next.directObjectGender = prev.directObjectGender ?? "masc";
    } else {
      delete next.directObjectGender;
    }
  }
  if (slot === "indirectObject") {
    delete next.indirectObjectAdjective;
    delete next.indirectObjectAdjective2;
    if (concept.gendered) {
      next.indirectObjectGender = prev.indirectObjectGender ?? "masc";
    } else {
      delete next.indirectObjectGender;
    }
  }
  if (COMPLEMENT_KEY_SET.has(slot)) {
    // Swapping the complement noun invalidates its adjectives.
    delete next[`${slot}Adjective` as keyof PhraseSelection];
    delete next[`${slot}Adjective2` as keyof PhraseSelection];
    const gKey = `${slot}Gender` as keyof PhraseSelection;
    if (concept.gendered) {
      (next[gKey] as "masc" | "fem") =
        (prev[gKey] as "masc" | "fem") ?? "masc";
    } else {
      delete next[gKey];
    }
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
    delete next.directObjectAdjective;
    delete next.directObjectAdjective2;
    delete next.indirectObject;
    delete next.indirectObjectNumber;
    delete next.indirectObjectGender;
    delete next.indirectObjectAdjective;
    delete next.indirectObjectAdjective2;
    delete next.subjectAdjective;
    delete next.subjectAdjective2;
    for (const type of COMPLEMENT_TYPES) {
      delete next[type];
      delete next[`${type}Number`];
      delete next[`${type}Gender`];
      delete next[`${type}Adjective`];
      delete next[`${type}Adjective2`];
    }
    delete next.routeSpecifier;
    delete next.causeSentiment;
  }
  if (slot === "subject") {
    delete next.subjectAdjective;
    delete next.subjectAdjective2;
    delete next.subjectNumber;
    delete next.subjectGender;
  }
  if (slot === "subjectAdjective") {
    delete next.subjectAdjective2;
  }
  if (slot === "directObject") {
    delete next.directObjectNumber;
    delete next.directObjectGender;
    delete next.directObjectAdjective;
    delete next.directObjectAdjective2;
  }
  if (slot === "directObjectAdjective") {
    delete next.directObjectAdjective2;
  }
  if (slot === "indirectObject") {
    delete next.indirectObjectNumber;
    delete next.indirectObjectGender;
    delete next.indirectObjectAdjective;
    delete next.indirectObjectAdjective2;
  }
  if (slot === "indirectObjectAdjective") {
    delete next.indirectObjectAdjective2;
  }
  if (COMPLEMENT_KEY_SET.has(slot)) {
    delete next[`${slot}Number` as keyof PhraseSelection];
    delete next[`${slot}Gender` as keyof PhraseSelection];
    delete next[`${slot}Adjective` as keyof PhraseSelection];
    delete next[`${slot}Adjective2` as keyof PhraseSelection];
    if (slot === "route") delete next.routeSpecifier;
    if (slot === "cause") delete next.causeSentiment;
  }
  // Clearing a complement's first adjective drops the chained second one.
  for (const type of COMPLEMENT_TYPES) {
    if (slot === `${type}Adjective`) {
      delete next[`${type}Adjective2` as keyof PhraseSelection];
    }
  }
  return next;
}
