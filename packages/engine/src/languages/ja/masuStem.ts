import type { ConceptForms } from '../../types.js';

/**
 * The polite stem of a verb (行きます → 行き) with its reading, or null when the lexeme
 * carries no ます form. Everything polite — the tense endings, the modal suffixes — is
 * built by appending to this.
 */
export function masuStem(verb: ConceptForms): { stem: string; reading?: string } | null {
  const masuPresent = verb.forms['masu_present'] ?? '';
  if (!masuPresent.endsWith('ます')) return null;
  const masuReading = verb.forms['masu_present_reading'];
  return {
    stem: masuPresent.slice(0, -2),
    reading: masuReading?.endsWith('ます') ? masuReading.slice(0, -2) : undefined,
  };
}
