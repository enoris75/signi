import { Concept } from "@signi/shared";
import { useConcepts } from "../../hooks/useConcepts";
import { useUiString } from "../../i18n/useUiString.ts";
import { usePickerKeys } from "./hooks/usePickerKeys.ts";
import { PickerList } from "./PickerList.tsx";

export function VerbTypeahead({
  onSelect,
}: {
  onSelect: (concept: Concept) => void;
}) {
  const { data: allVerbs = [] } = useConcepts("verb");
  const t = useUiString();
  const prompt = `${t("slot.verb.placeholder")}…`;

  // Modals are verb concepts too, but they govern a verb rather than heading a clause,
  // so they belong in the modal slots (see ModalTypeahead), never here.
  const verbs = allVerbs.filter((v) => !v.modal);
  const picker = usePickerKeys({ items: verbs, onSelect });

  return (
    <PickerList
      picker={picker}
      placeholder={prompt}
      inputProps={{ "data-testid": "typeahead-verb" }}
    />
  );
}
