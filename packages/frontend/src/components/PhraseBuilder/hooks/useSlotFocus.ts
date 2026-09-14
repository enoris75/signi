import { useState, type Dispatch, type SetStateAction } from "react";
import type { PhraseSelection, SlotKey } from "../interfaces.ts";
import { slotKindFor } from "../functions/slotKindFor.ts";

// Which word box a builder is working on: the slot in hand, the filled box open for re-picking, and
// the word-category each switchable box offers.
export function useSlotFocus(selection: PhraseSelection): {
  // The slot the pickers fill. A period starts on its subject noun phrase — translation begins as
  // soon as a subject is chosen, so a verbless period (a bare noun phrase like "breaking news") is
  // possible.
  activeSlot: SlotKey | null;
  setActiveSlot: Dispatch<SetStateAction<SlotKey | null>>;
  // A filled word box the user clicked to change its word: its inline picker is shown over the
  // current word. Null when no box is being re-picked.
  editingSlot: SlotKey | null;
  setEditingSlot: Dispatch<SetStateAction<SlotKey | null>>;
  selectSlot: (slot: SlotKey) => void;
  // Click a filled word box to change its word: select the slot and open its inline picker over the
  // current word (see SlotNode / slotTypeahead `editing`).
  editSlot: (slot: SlotKey) => void;
  // Focus left a box being re-picked without a new word chosen — restore the word.
  cancelEdit: (slot: SlotKey) => void;
  // The word-category (noun|pronoun / noun|adjective) a switchable box offers (see slotKindFor).
  slotKind: (slot: SlotKey) => string;
  // Set by the on-box toggle or the in-dropdown selector — the two read the same value, so they stay
  // in sync.
  setSlotKind: (slot: SlotKey, kind: string) => void;
} {
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>("subject");
  const [editingSlot, setEditingSlot] = useState<SlotKey | null>(null);
  const [chosenKinds, setChosenKinds] = useState<Record<string, string>>({});
  return {
    activeSlot,
    setActiveSlot,
    editingSlot,
    setEditingSlot,
    selectSlot: (slot) => setActiveSlot(slot),
    editSlot: (slot) => {
      setActiveSlot(slot);
      setEditingSlot(slot);
    },
    cancelEdit: (slot) => setEditingSlot((cur) => (cur === slot ? null : cur)),
    slotKind: (slot) => slotKindFor(slot, chosenKinds, selection),
    setSlotKind: (slot, kind) => setChosenKinds((prev) => ({ ...prev, [slot]: kind })),
  };
}
