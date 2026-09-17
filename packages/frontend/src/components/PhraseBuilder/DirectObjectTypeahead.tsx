import type { ReactNode } from "react";
import { Concept } from "@signi/shared";
import { useConcepts } from "../../hooks/useConcepts";
import { useUiString } from "../../i18n/useUiString.ts";
import { usePickerKeys, type PickerTabs } from "./hooks/usePickerKeys.ts";
import { PickerList } from "./PickerList.tsx";

export function DirectObjectTypeahead({
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
  const { data: nouns = [] } = useConcepts("noun");
  const t = useUiString();
  const picker = usePickerKeys({ items: nouns, onSelect, tabs });

  return (
    <PickerList
      picker={picker}
      placeholder={`${t("slot.noun.placeholder")}…`}
      inputProps={{ "data-testid": "typeahead-noun" }}
      header={header}
    />
  );
}
