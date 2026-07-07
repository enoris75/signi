import { ReactNode } from "react";
import { type Concept } from "@signi/shared";
import { PhraseSelection, SlotKey } from "./interfaces.ts";
import { COMPLEMENT_KEY_SET, COMPLEMENT_ADJECTIVE_TYPE } from "./slots.ts";
import { IndirectObjectTypeahead } from "./IndirectObjectTypeahead.tsx";
import { DirectObjectTypeahead } from "./DirectObjectTypeahead.tsx";
import { ModifierTypeahead } from "./ModifierTypeahead.tsx";
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
  nounSubject = false,
}: {
  slotKey: SlotKey;
  activeSlot: SlotKey | null;
  selection: PhraseSelection;
  onSelect: (concept: Concept, slot: SlotKey) => void;
  // In noun-phrase mode (possessor editor) the `subject` slot is a possessor head, which
  // is noun-only — so it uses the noun picker rather than the pronoun-inclusive one.
  nounSubject?: boolean;
}): ReactNode {
  // Only the active, still-empty slot renders a picker.
  if (slotKey !== activeSlot || selection[slotKey]) return undefined;

  const pick = (c: Concept) => onSelect(c, slotKey);

  switch (slotKey) {
    case "verb":
      return <VerbTypeahead onSelect={pick} />;
    case "subject":
      return nounSubject ? (
        <DirectObjectTypeahead onSelect={pick} />
      ) : (
        <SubjectTypeahead onSelect={pick} />
      );
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
      // Adjective slots carry the Adjective ⇄ Noun switch (a noun here is attributive).
      return <ModifierTypeahead onSelect={pick} />;
    default:
      // Complement adjectives (sourceAdjective, directionAdjective2, …) use the
      // same adjective/noun switch as the core roles.
      if (COMPLEMENT_ADJECTIVE_TYPE[slotKey])
        return <ModifierTypeahead onSelect={pick} />;
      // The causal complement ("because of him") also accepts a pronoun, so it uses the
      // pronoun-inclusive picker; the motion/locative complements stay noun-only.
      if (slotKey === "cause")
        return (
          <SubjectTypeahead onSelect={pick} placeholder="type a noun or pronoun…" />
        );
      // Motion/locative complements share the indirect-object picker.
      if (COMPLEMENT_KEY_SET.has(slotKey))
        return <IndirectObjectTypeahead onSelect={pick} />;
      return undefined;
  }
}
