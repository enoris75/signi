import { ReactNode } from "react";
import { type Concept } from "@signi/shared";
import { PhraseSelection, SlotKey } from "./interfaces.ts";
import { COMPLEMENT_KEY_SET } from "./slots.ts";
import { IndirectObjectTypeahead } from "./IndirectObjectTypeahead.tsx";
import { DirectObjectTypeahead } from "./DirectObjectTypeahead.tsx";
import { AdjectiveTypeahead } from "./AdjectiveTypeahead.tsx";
import { SubjectTypeahead } from "./SubjectTypeahead.tsx";
import { VerbTypeahead } from "./VerbTypeahead.tsx";

// The inline word-picker shown inside an empty, active slot box. Returns
// `undefined` for slots that aren't the active/empty target so the caller's
// placeholder ("choose…" / "empty") shows through.
export function slotTypeahead({
  slotKey,
  activeSlot,
  selection,
  onSelect,
}: {
  slotKey: SlotKey;
  activeSlot: SlotKey | null;
  selection: PhraseSelection;
  onSelect: (concept: Concept, slot: SlotKey) => void;
}): ReactNode {
  // Only the active, still-empty slot renders a picker.
  if (slotKey !== activeSlot || selection[slotKey]) return undefined;

  const pick = (c: Concept) => onSelect(c, slotKey);

  switch (slotKey) {
    case "verb":
      return <VerbTypeahead onSelect={pick} />;
    case "subject":
      return <SubjectTypeahead onSelect={pick} />;
    case "directObject":
      return <DirectObjectTypeahead onSelect={pick} />;
    case "indirectObject":
      return <IndirectObjectTypeahead onSelect={pick} />;
    case "subjectAdjective":
    case "subjectAdjective2":
    case "directObjectAdjective":
    case "directObjectAdjective2":
    case "indirectObjectAdjective":
    case "indirectObjectAdjective2":
      return <AdjectiveTypeahead onSelect={pick} />;
    default:
      // Motion/locative complements share the indirect-object picker.
      if (COMPLEMENT_KEY_SET.has(slotKey))
        return <IndirectObjectTypeahead onSelect={pick} />;
      return undefined;
  }
}
