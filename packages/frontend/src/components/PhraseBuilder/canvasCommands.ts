import {
  CLEARABLE_PARTS,
  COLLAPSIBLE_PARTS,
  REMOVABLE_PARTS,
  REVEALABLE_PARTS,
  type CanvasPart,
  type UiStringKey,
} from "@signi/shared";
import type { UiStringLookup } from "../../i18n/conceptWord.ts";

// The tooltips of the controls that act on one named part of the canvas — a word's clear button, a
// satellite's show / hide control, a ring's expand / compact toggle and its remove button. The catalog
// says each of them once per part ("clear the adjective", de "das Adjektiv löschen"), because the part's
// noun has to sit inside the command to take its article and case.
//
// A box, satellite or ring is told which part it is by the key its title comes from: the slot titles
// and satellite labels already name each part by its grammar noun, so that key doubles as the part's
// identity. Its English `label` stays what it was — the fallback, and for a ring the key its collapse
// state, layout rank and controls are stored under, which must not change with the UI language.
//
// A key missing here is a control that speaks English in every language, so every key a control
// can carry is checked against it (canvasCommands.test.ts).
const PART_BY_LABEL_KEY: Partial<Record<UiStringKey, CanvasPart>> = {
  "slot.subject": "subject",
  "slot.agent": "agent",
  "slot.verb": "verb",
  "slot.directObject": "object",
  "slot.adverb": "adverb",
  "category.adjective": "adjective",
  "slot.instrumental": "instrumental",
  "slot.predicative": "predicative",
  "slot.manner": "manner",
  "slot.possessor": "possessor",
  "satellite.determiner": "determiner",
  "slot.modal": "modal",
  "satellite.tense": "tense",
  "satellite.aspect": "aspect",
  "satellite.voice": "voice",
  "slot.verbPhrase": "verbPhrase",
  "slot.terminus": "terminus",
  "slot.locative": "locative",
  "slot.direction": "direction",
  "slot.source": "source",
  "slot.route": "route",
  "slot.temporal": "temporal",
  "slot.purpose": "purpose",
  "slot.topic": "topic",
  "slot.cause": "cause",
  "slot.objectPredicative": "objectPredicative",
  "slot.comitative": "comitative",
  "slot.role": "role",
  "slot.opponent": "opponent",
};

// The part `labelKey` names, if the control has a catalog family member for it.
function partIn<P extends CanvasPart>(parts: readonly P[], labelKey?: UiStringKey): P | undefined {
  const part = labelKey && PART_BY_LABEL_KEY[labelKey];
  return part && (parts as readonly CanvasPart[]).includes(part) ? (part as P) : undefined;
}

/** A clear button's tooltip: "Clear the adjective", or the English label for a part not yet named. */
export function clearTitle(t: UiStringLookup, label: string, labelKey?: UiStringKey): string {
  const part = partIn(CLEARABLE_PARTS, labelKey);
  return part ? t(`action.clear.${part}`) : `Clear ${label}`;
}

/** A reveal control's tooltip, naming what pressing it does: show the part, or hide it while shown. */
export function revealTitle(
  t: UiStringLookup,
  active: boolean,
  label: string,
  labelKey?: UiStringKey,
): string {
  const part = partIn(REVEALABLE_PARTS, labelKey);
  if (!part) return `${active ? "Hide" : "Show"} ${label}`;
  return active ? t(`action.hide.${part}`) : t(`action.show.${part}`);
}

/** A ring's collapse toggle's tooltip: expand the part while collapsed, else compact it. */
export function collapseTitle(
  t: UiStringLookup,
  collapsed: boolean,
  label: string,
  labelKey?: UiStringKey,
): string {
  const part = partIn(COLLAPSIBLE_PARTS, labelKey);
  // "Compact", as the catalog says it (COMPACT, not the seeded COLLAPSE, which is "fall down").
  if (!part) return `${collapsed ? "Expand" : "Compact"} ${label}`;
  return collapsed ? t(`action.expand.${part}`) : t(`action.compact.${part}`);
}

/** A complement ring's remove button's tooltip: "Remove the instrumental", or the English label. */
export function removeTitle(t: UiStringLookup, label: string, labelKey?: UiStringKey): string {
  const part = partIn(REMOVABLE_PARTS, labelKey);
  return part ? t(`action.remove.${part}`) : `Remove ${label}`;
}
