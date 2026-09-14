import type { Concept } from "@signi/shared";
import type { PhraseSelection, SlotKey } from "../interfaces.ts";
import { getActiveSlots, isModalSlot, SATELLITE_SLOT_KEYS } from "../slots.ts";

/**
 * Where focus goes once `concept` is picked into the empty `slot`: on to the next main word still
 * to choose. `selection` is the period as it was before the pick, and `visibleSlots` the slots it
 * shows. Answers the slot to focus, null to close the picker, or undefined to leave focus where it
 * is (the last word is filled).
 */
export function nextActiveSlot({
  slot,
  concept,
  selection,
  visibleSlots,
}: {
  slot: SlotKey;
  concept: Concept;
  selection: PhraseSelection;
  visibleSlots: readonly { key: SlotKey }[];
}): SlotKey | null | undefined {
  if (slot === "verb") {
    // The verb decides which slots the period has from here on.
    const slots = getActiveSlots(
      concept.transitivity,
      selection.subject?.role,
      Boolean(selection.subjectAdjective),
      concept.complements,
    );
    // A subject-dropping mood (command / infinitive citation) has no subject box to land on, so
    // after the verb the focus advances to the object instead of the dropped subject.
    const subjectDropped = Boolean(selection.imperative || selection.infinitive);
    if (!selection.subject && !subjectDropped) return "subject";
    return (
      slots.find(
        (s) =>
          s.key !== "verb" &&
          s.key !== "subject" &&
          !SATELLITE_SLOT_KEYS.has(s.key) &&
          !selection[s.key],
      )?.key ?? null
    );
  }
  // Setting an adjective or a modal just closes the picker; the next link in the chain is opened
  // explicitly, from the control this box now carries.
  if (/Adjective\d?$/.test(slot) || isModalSlot(slot)) return null;
  // Otherwise, the next empty main slot after this one (satellites are only opened explicitly).
  const currentIdx = visibleSlots.findIndex((s) => s.key === slot);
  return visibleSlots
    .slice(currentIdx + 1)
    .find((s) => !SATELLITE_SLOT_KEYS.has(s.key) && !selection[s.key])?.key;
}
