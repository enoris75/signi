import { ReactNode } from "react";
import { type Concept } from "@signi/shared";
import { ConceptSelectOpts, PhraseSelection, slotCategories, SlotKey } from "./interfaces.ts";
import { COMPLEMENT_KEY_SET, MODAL_ADVERB_SLOTS } from "./slots.ts";
import { DirectObjectTypeahead } from "./DirectObjectTypeahead.tsx";
import { ModalTypeahead } from "./ModalTypeahead.tsx";
import { ModifierTypeahead } from "./ModifierTypeahead.tsx";
import { AdverbTypeahead } from "./AdverbTypeahead.tsx";
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
  pickerSlot,
  editing = false,
  kind,
  onKindChange,
}: {
  slotKey: SlotKey;
  activeSlot: SlotKey | null;
  selection: PhraseSelection;
  onSelect: (concept: Concept, slot: SlotKey, opts?: ConceptSelectOpts) => void;
  // In noun-phrase mode (an owner's ring) the `subject` slot is the owner's head, which is
  // noun-only — so it uses the noun picker rather than the pronoun-inclusive one.
  nounSubject?: boolean;
  // The slot whose picker it opens, where it is not its own (P13: a predicate's conjunct's `subject`).
  pickerSlot?: SlotKey;
  // Re-picking the word of an already-filled box: bypass the empty/active guard so the
  // picker renders over the current word.
  editing?: boolean;
  // The controlled word-category for a switchable slot, shared with the on-box toggle so
  // the in-dropdown selector and the box selector move together. Undefined for a
  // single-vocabulary slot (the picker ignores it).
  kind?: string;
  onKindChange?: (kind: string) => void;
}): ReactNode {
  // Only the active, still-empty slot renders a picker — unless we're editing a filled one.
  if (!editing && (slotKey !== activeSlot || selection[slotKey])) return undefined;

  const pick = (c: Concept, opts?: ConceptSelectOpts) => onSelect(c, slotKey, opts);

  return pickerFor(pickerSlot ?? slotKey, pick, nounSubject, kind, onKindChange);
}

// Whether a slot type offers an inline word-picker — i.e. a filled box of this kind can
// be clicked to change its word. (Every word slot, including the adverb `modifier`, does.)
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
  // The controlled category + setter for a switchable slot (see slotTypeahead). The
  // starting class for a re-pick is decided by the caller (from the held concept's role).
  kind?: string,
  onKindChange?: (kind: string) => void,
): ReactNode {
  switch (slotKey) {
    case "verb":
      return <VerbTypeahead onSelect={pick} />;
    case "subject":
      return nounSubject ? (
        <DirectObjectTypeahead onSelect={pick} />
      ) : (
        <SubjectTypeahead onSelect={pick} kind={kind} onKindChange={onKindChange} />
      );
    case "directObject":
      // The object takes a pronoun as readily as the subject does ("I see you"), so it gets the
      // same pronoun-inclusive picker — under the prompt the causal complement already uses,
      // since "a subject" is not what this box wants.
      return (
        <SubjectTypeahead
          onSelect={pick}
          placeholderKey="slot.nounOrPronoun.placeholder"
          kind={kind}
          onKindChange={onKindChange}
          testId="typeahead-noun"
        />
      );
    case "verbModal":
    case "verbModal2":
      // Modals are verb concepts, so the modal picker filters the verb list on `modal`.
      return <ModalTypeahead onSelect={pick} />;
    default:
      // Every adjective slot — the core roles' chains and the complements'
      // (sourceAdjective, directionAdjective2, …) alike — carries the Adjective ⇄ Noun
      // switch (a noun here is attributive). The subject complement takes a predicate noun
      // ("becomes a legend") or a predicate adjective ("seems happy") — the same switch.
      if (/Adjective\d?$/.test(slotKey) || slotKey === "predicative")
        return (
          <ModifierTypeahead
            onSelect={pick}
            kind={kind}
            onKindChange={onKindChange}
            options={slotCategories(slotKey)?.options}
          />
        );
      // The verb's adverb slot and each modal's own adverb slot — a single-vocabulary adverb picker.
      if (slotKey === "modifier" || MODAL_ADVERB_SLOTS.includes(slotKey as SlotKey))
        return <AdverbTypeahead onSelect={pick} />;
      // The complements that take a pronoun behind their adposition — the cause, the purpose, the
      // topic, the companion and the opponent: "because of him", "for her", "with her", "against
      // him" — use the pronoun-inclusive picker; the motion/locative complements stay noun-only.
      // Which ones is slotCategories' to say, so the model, the console and this picker agree (P09-E45).
      if (slotCategories(slotKey)?.options.some((o) => o.value === "pronoun"))
        return (
          <SubjectTypeahead
            onSelect={pick}
            placeholderKey="slot.nounOrPronoun.placeholder"
            kind={kind}
            onKindChange={onKindChange}
          />
        );
      // Every other complement — the motion/locative family and the dative terminus — is a
      // plain noun head, so they share the noun picker.
      if (COMPLEMENT_KEY_SET.has(slotKey))
        return <DirectObjectTypeahead onSelect={pick} />;
      return undefined;
  }
}
