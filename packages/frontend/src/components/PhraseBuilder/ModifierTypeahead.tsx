import { useState } from "react";
import type { Concept } from "@signi/shared";
import { AdjectiveTypeahead } from "./AdjectiveTypeahead.tsx";
import { DirectObjectTypeahead } from "./DirectObjectTypeahead.tsx";
import { CategoryToggle } from "./Boxes.tsx";
import type { SlotCategory } from "./interfaces.ts";

/**
 * A picker that switches between the adjective and the noun vocabulary. Used by every
 * adjective slot — a real adjective ("big") or a noun used attributively ("sail" → "sail
 * boat") — and by the subject complement, whose head is a predicate noun ("becomes a
 * legend") or a predicate adjective ("seems happy"). The picked concept's `role` is what
 * downstream code reads to tell the two apart; this toggle only chooses which vocabulary
 * is searched.
 *
 * The Adj / Noun switch rides inside the dropdown (the picker's sticky header), mirroring
 * the on-box toggle the empty box carries; both read/write one `kind` when the box supplies
 * `onKindChange`, so they stay in sync.
 */
const DEFAULT_MODIFIER_OPTIONS: SlotCategory[] = [
  { value: "adjective", labelKey: "category.adjective" },
  { value: "noun", labelKey: "category.noun" },
];

export function ModifierTypeahead({
  onSelect,
  kind = "adjective",
  onKindChange,
  // The category options for the in-dropdown switch, ordered to match the on-box toggle of
  // this slot. Defaults to Adj | Noun for a bare (uncontrolled) picker.
  options = DEFAULT_MODIFIER_OPTIONS,
}: {
  onSelect: (concept: Concept) => void;
  kind?: string;
  onKindChange?: (kind: string) => void;
  options?: SlotCategory[];
}) {
  // Controlled when the box wires `onKindChange`; otherwise owned locally so a bare
  // <ModifierTypeahead/> still switches vocabulary on its own.
  const [localKind, setLocalKind] = useState<string>(kind);
  const value = onKindChange ? kind : localKind;
  const setValue = onKindChange ?? setLocalKind;
  const header = (
    <CategoryToggle options={options} value={value} onChange={setValue} />
  );
  return value === "adjective" ? (
    <AdjectiveTypeahead onSelect={onSelect} header={header} />
  ) : (
    <DirectObjectTypeahead onSelect={onSelect} header={header} />
  );
}
