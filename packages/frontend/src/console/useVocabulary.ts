import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { UI_STRINGS, type Concept, type UiStringKey } from "@signi/shared";
import { fetchUiStrings } from "../api.ts";
import { useConcepts } from "../hooks/useConcepts.ts";
import { useUiLanguage } from "../i18n/LanguageContext.tsx";
import { conceptGloss, conceptWord } from "../i18n/conceptWord.ts";
import type { Vocabulary } from "./language/types.ts";

/**
 * The words the console can name: the pickers' own concept lists, from the react-query cache they
 * already fill, labelled the way the pickers label them. No request of its own, so completion can run
 * synchronously on every keystroke.
 *
 * It is one object for as long as the words and the language are the same: the console's preview is
 * derived from it, and a vocabulary rebuilt every render would rebuild the preview with it.
 */
export function useVocabulary(): Vocabulary {
  const { uiLanguage } = useUiLanguage();
  const { data: strings } = useQuery({ queryKey: ["ui-strings"], queryFn: fetchUiStrings, staleTime: Infinity });
  const label = useCallback(
    (concept: Concept) =>
      conceptWord(concept, uiLanguage, (key: UiStringKey) => strings?.[key]?.[uiLanguage] ?? UI_STRINGS[key].fallback),
    [uiLanguage, strings],
  );
  const gloss = useCallback((concept: Concept) => conceptGloss(concept, uiLanguage), [uiLanguage]);
  const { data: noun } = useConcepts("noun");
  const { data: pronoun } = useConcepts("pronoun");
  const { data: verb } = useConcepts("verb");
  const { data: adjective } = useConcepts("adjective");
  const { data: adverb } = useConcepts("adverb");
  // The period's interjection (P09-E47), which `/interj` names.
  const { data: interjection } = useConcepts("interjection");
  return useMemo(
    () => ({ concepts: { noun, pronoun, verb, adjective, adverb, interjection }, language: uiLanguage, label, gloss }),
    [noun, pronoun, verb, adjective, adverb, interjection, uiLanguage, label, gloss],
  );
}
