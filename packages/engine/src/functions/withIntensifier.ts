import type { ConceptForms } from '../types.js';

/**
 * Put an adjective's intensifier where its own lexeme says it goes (see NounPhrase.adjectiveIntensifiers):
 * before the adjective in six languages and for pt *muito* ("very big", "molto grande", "sehr groß"),
 * after it for pt *demais* ("grande demais"). It wraps the adjective's **finished** surface, degree
 * and agreement included, so an intensified comparative reads "molto più grande" and the intensifier
 * itself never agrees with anything — an adverb does not.
 *
 * The `suffix` position is not a word standing anywhere (ja 〜すぎる), so nothing is placed here and
 * the surface comes back unchanged; the Japanese engine builds that one into the adjective itself.
 * Localization C33.
 */
export function withIntensifier(a: ConceptForms, surface: string): string {
  const word = a.forms['intensifier'];
  if (!word || !surface) return surface;
  const position = a.forms['intensifier_position'] ?? 'pre';
  if (position === 'suffix') return surface;
  return position === 'post' ? `${surface} ${word}` : `${word} ${surface}`;
}
