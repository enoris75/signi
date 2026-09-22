import type { ConceptForms } from '../../types.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolve } from './resolve.js';

/**
 * Thread an adjective's intensifier onto its forms, the way the comparative degree is threaded
 * (see resolveNounPhrase): the intensifier is a concept of its own — VERY, TOO — so it is resolved
 * in this language like any other word, and what the engines need of it rides on the adjective they
 * are already holding.
 *
 * Three keys land there: `intensifier` (the word), `intensifier_reading` (its furigana, where the
 * language has one) and `intensifier_position` — `pre` (the default: "very big", "molto grande",
 * "sehr groß"), `post` (pt *grande demais*) or `suffix`, which is not a word standing anywhere but
 * an ending on the adjective's stem (ja 大きすぎる). A missing id, or one that resolves to nothing,
 * leaves the adjective untouched. Localization C33.
 */
export function applyIntensifier(
  adjective: ConceptForms,
  id: string | undefined,
  language: string,
  lookup: LexiconLookup,
): void {
  if (!id) return;
  const word = resolve(id, language, lookup).forms;
  const base = word['base'];
  if (!base) return;
  adjective.forms['intensifier'] = base;
  adjective.forms['intensifier_position'] = word['position'] ?? 'pre';
  if (word['reading']) adjective.forms['intensifier_reading'] = word['reading'];
}
