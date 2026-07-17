import type { Concept } from '@signi/shared';
import { useCallback } from 'react';
import { conceptWord } from './conceptWord.ts';
import { useUiLanguage } from './LanguageContext.tsx';
import { useUiString } from './useUiString.ts';

/**
 * Returns `word`, giving a concept's citation form in the current UI language — the word the
 * pickers list and the boxes show. See conceptWord() for the fallback chain and the pronoun
 * exception.
 */
export function useConceptLabel(): (concept: Concept) => string {
  const { uiLanguage } = useUiLanguage();
  const t = useUiString();
  return useCallback((concept: Concept) => conceptWord(concept, uiLanguage, t), [uiLanguage, t]);
}

/**
 * Returns `gloss`, the parenthesised disambiguator a picker shows beside the word ("cry
 * (weep)"). The gloss is an English synonym, so it is only shown beside the English word; in
 * another language it would gloss a word with one from a different language.
 */
export function useConceptGloss(): (concept: Concept) => string | undefined {
  const { uiLanguage } = useUiLanguage();
  return useCallback(
    (concept: Concept) => (uiLanguage === 'en' ? concept.synonym : undefined),
    [uiLanguage],
  );
}

/**
 * Returns `definition`, the concept's dictionary gloss in the current UI language — the text a
 * picker shows in a tooltip on hover. Only English is populated so far, so any other UI language
 * falls back to the English definition (and, defensively, to the always-present `description`).
 */
export function useConceptDefinition(): (concept: Concept) => string {
  const { uiLanguage } = useUiLanguage();
  return useCallback(
    (concept: Concept) =>
      concept.definitions?.[uiLanguage] ?? concept.definitions?.en ?? concept.description,
    [uiLanguage],
  );
}

/**
 * Returns `matches`, the predicate the pickers filter on. A search hits the word as shown (in
 * the current language) as well as its English label and gloss, so a user who knows the English
 * word can still find it while browsing in another language. It also hits the word's reading,
 * so a Japanese word can be found by typing the kana a keyboard actually produces (ねこ → 猫).
 */
export function useConceptSearch(): (concept: Concept, query: string) => boolean {
  const { uiLanguage } = useUiLanguage();
  const word = useConceptLabel();

  return useCallback(
    (concept: Concept, query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const reading = concept.readings?.[uiLanguage] ?? '';
      const haystack = `${word(concept)} ${reading} ${concept.label ?? ''} ${concept.synonym ?? ''}`;
      return haystack.toLowerCase().includes(q);
    },
    [word, uiLanguage],
  );
}
