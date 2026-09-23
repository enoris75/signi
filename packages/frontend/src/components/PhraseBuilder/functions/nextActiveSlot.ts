import type { Concept } from "@signi/shared";
import type { PhraseSelection, SlotKey } from "../interfaces.ts";
import { getActiveSlots, isModalSlot, offeredComplements, SATELLITE_SLOT_KEYS } from "../slots.ts";

/**
 * Where the cursor goes once `concept` is picked into the empty `slot`: on to the next main word
 * still to choose. `selection` is the period as it was before the pick, and `visibleSlots` the
 * slots it shows. Undefined where there is nowhere to advance to — the last word of the period,
 * or a chained adjective or modal whose next link opens from the box just filled — and the cursor
 * then stays on that box.
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
}): SlotKey | undefined {
  if (slot === "verb") {
    // The verb decides which slots the period has from here on.
    const slots = getActiveSlots(
      concept.transitivity,
      selection.subject?.role,
      Boolean(selection.subjectAdjective),
      offeredComplements(concept),
    );
    // A subject-dropping mood (command / infinitive citation) has no subject box to land on, so
    // after the verb the focus advances to the object instead of the dropped subject.
    const subjectDropped = Boolean(selection.imperative || selection.infinitive);
    if (!selection.subject && !subjectDropped) return "subject";
    return slots.find(
      (s) =>
        s.key !== "verb" &&
        s.key !== "subject" &&
        !SATELLITE_SLOT_KEYS.has(s.key) &&
        !selection[s.key],
    )?.key;
  }
  // Setting an adjective or a modal advances nowhere: the next link in the chain is opened
  // explicitly, from the control the box just filled now carries.
  if (/Adjective\d?$/.test(slot) || isModalSlot(slot)) return undefined;
  // Otherwise, the next empty main slot after this one (satellites are only opened explicitly).
  const currentIdx = visibleSlots.findIndex((s) => s.key === slot);
  return visibleSlots
    .slice(currentIdx + 1)
    .find((s) => !SATELLITE_SLOT_KEYS.has(s.key) && !selection[s.key])?.key;
}
