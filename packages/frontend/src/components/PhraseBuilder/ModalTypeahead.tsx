import { Concept } from "@signi/shared";
import { useConcepts } from "../../hooks/useConcepts";
import { useUiString } from "../../i18n/useUiString.ts";
import { usePickerKeys } from "./hooks/usePickerKeys.ts";
import { PickerList } from "./PickerList.tsx";

// Picker for a modal slot. Modals are verb concepts, so they arrive on the same
// `role=verb` fetch as the main verbs; `Concept.modal` is what separates the two lists
// (VerbTypeahead filters them out, this one filters them in).
export function ModalTypeahead({
  onSelect,
}: {
  onSelect: (concept: Concept) => void;
}) {
  const { data: verbs = [] } = useConcepts("verb");
  const t = useUiString();
  const picker = usePickerKeys({ items: verbs.filter((v) => v.modal), onSelect });

  return (
    <PickerList
      picker={picker}
      placeholder={`${t("slot.modal.placeholder")}…`}
      inputProps={{ size: 13 }}
      fitToPlaceholder
    />
  );
}
