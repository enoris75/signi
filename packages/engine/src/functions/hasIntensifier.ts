import type { ConceptForms } from '../types.js';

/**
 * Whether an adjective carries an intensifier (see NounPhrase.adjectiveIntensifiers). The Romance
 * engines read it beside the comparative degree: an intensified adjective follows the noun even
 * where its plain form precedes it — "un altro gatto" but "un gatto molto altro" — because the
 * adverb belongs with the phrase, not between the article and the noun, exactly as a degree adverb
 * does ("il gatto più grande"). Localization C33.
 */
export function hasIntensifier(a: ConceptForms): boolean {
  return !!a.forms['intensifier'];
}
