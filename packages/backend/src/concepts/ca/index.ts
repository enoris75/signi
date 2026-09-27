import type { LanguageColumn } from '../types.js';
import { CA_PRONOUNS } from './pronouns.js';
import { CA_INTERJECTIONS } from './interjections.js';
import { CA_NOUNS } from './nouns.js';
import { CA_ADJECTIVES } from './adjectives.js';
import { CA_ADVERBS } from './adverbs.js';
import { CA_VERBS } from './verbs.js';

/**
 * The Catalan column (`ca`, P03), Central Catalan in the IEC standard (P03 D1), keyed by concept id
 * and merged into each concept as `forms.ca` by `concepts/index.ts`, the shape of the Romansh columns
 * (P04-E4). Every form is *(verify)* until the native review (P03-E11). A concept left out borrows
 * Spanish's forms at merge time (`columns.ts`) — never a gap in the row.
 */
export const CA: LanguageColumn = {
  ...CA_PRONOUNS,
  ...CA_INTERJECTIONS,
  ...CA_NOUNS,
  ...CA_ADJECTIVES,
  ...CA_ADVERBS,
  ...CA_VERBS,
};
