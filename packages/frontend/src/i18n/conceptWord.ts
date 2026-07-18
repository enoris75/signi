import type { Concept, LanguageCode, UiStringKey } from '@signi/shared';

/** Resolves a UI string in the current UI language — the `t` of useUiString(). */
export type UiStringLookup = (key: UiStringKey) => string;

/**
 * The concept as the user should read it: its citation form in `language` ("cat" / "gatto" /
 * "Katze"), from the label catalog the concept list carries. A concept not yet seeded in that
 * language falls back to English, then to its description, so a word never renders blank.
 *
 * Pronouns are the exception: the concept is a person, not a word, and its surface form is only
 * settled once the chooser has fixed number and gender — so it shows the person it stands for
 * ("first person" / "prima persona" / 第一の人称), which the engine renders like any other UI
 * string. Without a `t` it falls back to the concept's English description.
 *
 * Components should reach for `useConceptLabel()` instead; this bare form exists for the
 * plain builders (satellites) that run outside a hook.
 */
export function conceptWord(concept: Concept, language: LanguageCode, t?: UiStringLookup): string;
export function conceptWord(
  concept: Concept | undefined,
  language: LanguageCode,
  t?: UiStringLookup,
): string | undefined;
export function conceptWord(
  concept: Concept | undefined,
  language: LanguageCode,
  t?: UiStringLookup,
): string | undefined {
  if (!concept) return undefined;
  if (concept.role === 'pronoun') {
    const person = concept.person;
    if (!t || !person) return concept.description;
    // The generic subject shares 3rd-person agreement with he/she/it but is not that person, so
    // it is named by its own category ("impersonal") rather than "third person".
    if (concept.id === 'GENERIC_PERSON') return t('pronoun.person.impersonal');
    return t(`pronoun.person.${person}` as UiStringKey);
  }
  return concept.labels?.[language] ?? concept.label ?? concept.description;
}

/**
 * The furigana for the word `conceptWord()` returns: the kana reading of the concept's citation
 * form in `language` (猫 → ねこ), or undefined when the language supplies none or the word needs
 * none — a word already written in kana reads as itself. Only Japanese seeds readings today.
 *
 * It is undefined whenever the word is not the seeded one: a pronoun (which shows its
 * description) and any concept that fell back to another language would otherwise get a reading
 * that doesn't belong to the text on screen.
 */
export function conceptReading(
  concept: Concept | undefined,
  language: LanguageCode,
): string | undefined {
  if (!concept || concept.role === 'pronoun') return undefined;
  if (concept.labels?.[language] === undefined) return undefined;
  return concept.readings?.[language];
}
