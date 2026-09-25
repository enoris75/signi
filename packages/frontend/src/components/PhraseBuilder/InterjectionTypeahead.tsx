import { Concept } from "@signi/shared";
import { useConcepts } from "../../hooks/useConcepts";
import { useUiString } from "../../i18n/useUiString.ts";
import { usePickerKeys } from "./hooks/usePickerKeys.ts";
import { PickerList } from "./PickerList.tsx";

// The inline picker for the period's interjection box (P09-E47): a single-vocabulary typeahead over
// the interjection concepts, the mirror of AdverbTypeahead.
export function InterjectionTypeahead({
  onSelect,
}: {
  onSelect: (concept: Concept) => void;
}) {
  const { data: interjections = [] } = useConcepts("interjection");
  const t = useUiString();
  const picker = usePickerKeys({ items: interjections, onSelect });

  return <PickerList picker={picker} placeholder={`${t("slot.interjection.placeholder")}…`} />;
}
