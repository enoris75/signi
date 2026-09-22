import type { ReactNode } from "react";
import { Concept } from "@signi/shared";
import { useConcepts } from "../../hooks/useConcepts";
import { useUiString } from "../../i18n/useUiString.ts";
import { usePickerKeys, type PickerTabs } from "./hooks/usePickerKeys.ts";
import { PickerList } from "./PickerList.tsx";

// A concept whose slot is not its role's is filtered out here: it reuses this role's lexicon and
// arrives on the same fetch, but nothing it could fill is in this picker — the split
// ModalTypeahead / VerbTypeahead make on `Concept.modal`, one level out (see `ConceptSlot`).
// Here that is OWN_ADJECTIVE, which exists only beside a possessor: "an own cat" is not a phrase.
export function AdjectiveTypeahead({
  onSelect,
  // Optional sticky content pinned to the top of the dropdown — used to surface the
  // word-category switch inside the picker (mirroring the on-box toggle).
  header,
  // The same switch as key-driven state: ↑ from the first row moves the cursor up into it.
  tabs,
}: {
  onSelect: (concept: Concept) => void;
  header?: ReactNode;
  tabs?: PickerTabs;
}) {
  const { data: allAdjectives = [] } = useConcepts("adjective");
  const adjectives = allAdjectives.filter((a) => !a.slot);
  const t = useUiString();
  const picker = usePickerKeys({ items: adjectives, onSelect, tabs });

  return (
    <PickerList
      picker={picker}
      placeholder={`${t("slot.adjective.placeholder")}…`}
      header={header}
    />
  );
}
