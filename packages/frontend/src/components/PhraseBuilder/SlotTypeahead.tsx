import { ReactNode } from "react";
import { type Concept } from "@signi/shared";
import { ConceptSelectOpts, PhraseSelection, SlotKey } from "./interfaces.ts";
import { COMPLEMENT_KEY_SET } from "./slots.ts";
import { IndirectObjectTypeahead } from "./IndirectObjectTypeahead.tsx";
import { DirectObjectTypeahead } from "./DirectObjectTypeahead.tsx";
import { ModalTypeahead } from "./ModalTypeahead.tsx";
import { ModifierTypeahead } from "./ModifierTypeahead.tsx";
import { SubjectTypeahead } from "./SubjectTypeahead.tsx";
import { VerbTypeahead } from "./VerbTypeahead.tsx";

// The inline word-picker shown inside an empty, active slot box — or, when `editing`,
// inside an already-filled box the user clicked to change its word. Returns
// `undefined` for slots that aren't the active/empty target (or that have no inline
// picker) so the caller's placeholder ("choose…" / "empty") / word shows through.
export function slotTypeahead({
  slotKey,
  activeSlot,
  selection,
  onSelect,
  nounSubject = false,
  editing = false,
}: {
  slotKey: SlotKey;
  activeSlot: SlotKey | null;
  selection: PhraseSelection;
  onSelect: (concept: Concept, slot: SlotKey, opts?: ConceptSelectOpts) => void;
  // In noun-phrase mode (possessor editor) the `subject` slot is a possessor head, which
  // is noun-only — so it uses the noun picker rather than the pronoun-inclusive one.
  nounSubject?: boolean;
  // Re-picking the word of an already-filled box: bypass the empty/active guard so the
  // picker renders over the current word.
  editing?: boolean;
}): ReactNode {
  // Only the active, still-empty slot renders a picker — unless we're editing a filled one.
  if (!editing && (slotKey !== activeSlot || selection[slotKey])) return undefined;

  const pick = (c: Concept, opts?: ConceptSelectOpts) => onSelect(c, slotKey, opts);

  return pickerFor(slotKey, pick, nounSubject);
}

// Whether a slot type offers an inline word-picker — i.e. a filled box of this kind can
// be clicked to change its word. (Every word slot but the adverb `modifier` does.)
export function slotHasInlinePicker(
  slotKey: SlotKey,
  nounSubject = false,
): boolean {
  return pickerFor(slotKey, () => {}, nounSubject) != null;
}

function pickerFor(
  slotKey: SlotKey,
  pick: (c: Concept, opts?: ConceptSelectOpts) => void,
  nounSubject: boolean,
): ReactNode {
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
    case "verbModal":
    case "verbModal2":
      // Modals are verb concepts, so the modal picker filters the verb list on `modal`.
      return <ModalTypeahead onSelect={pick} />;
    default:
      // Every adjective slot — the core roles' chains and the complements'
      // (sourceAdjective, directionAdjective2, …) alike — carries the Adjective ⇄ Noun
      // switch (a noun here is attributive).
      if (/Adjective\d?$/.test(slotKey))
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
