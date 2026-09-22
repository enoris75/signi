import { Concept } from "@signi/shared";
import { useConcepts } from "../../hooks/useConcepts";
import { useUiString } from "../../i18n/useUiString.ts";
import { usePickerKeys } from "./hooks/usePickerKeys.ts";
import { PickerList } from "./PickerList.tsx";

// The inline picker for the verb's adverb (`modifier`) slot and each modal's own adverb. A
// single-vocabulary typeahead over the adverb concepts — the mirror of AdjectiveTypeahead.
//
// A concept whose slot is not its role's is filtered out here: it reuses this role's lexicon and
// arrives on the same fetch, but nothing it could fill is in this picker — the split
// ModalTypeahead / VerbTypeahead make on `Concept.modal`, one level out (see `ConceptSlot`).
// Here that is VERY and TOO, which modify an adjective: "the cat runs very" is not a sentence.
export function AdverbTypeahead({
  onSelect,
}: {
  onSelect: (concept: Concept) => void;
}) {
  const { data: adverbs = [] } = useConcepts("adverb");
  const t = useUiString();
  const picker = usePickerKeys({ items: adverbs.filter((a) => !a.slot), onSelect });

  return <PickerList picker={picker} placeholder={`${t("slot.adverb.placeholder")}…`} />;
}
