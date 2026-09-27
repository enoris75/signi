import type { LanguageColumn } from '../types.js';
import { RM_VALLADER_PRONOUNS } from './pronouns.js';
import { RM_VALLADER_INTERJECTIONS } from './interjections.js';
import { RM_VALLADER_NOUNS } from './nouns.js';
import { RM_VALLADER_ADJECTIVES } from './adjectives.js';
import { RM_VALLADER_ADVERBS } from './adverbs.js';
import { RM_VALLADER_VERBS } from './verbs.js';

/**
 * The Vallader column (`rm-vallader`, P04), keyed by concept id and merged into each concept as
 * `forms['rm-vallader']` by `concepts/index.ts`, the shape of the Swiss German column (P10-E4). Every
 * form is *(verify)* until the variety's review (P04-E19). A concept left out borrows its closest
 * language's forms at merge time (`columns.ts`) — never a gap in the row.
 */
export const RM_VALLADER: LanguageColumn = {
  ...RM_VALLADER_PRONOUNS,
  ...RM_VALLADER_INTERJECTIONS,
  ...RM_VALLADER_NOUNS,
  ...RM_VALLADER_ADJECTIVES,
  ...RM_VALLADER_ADVERBS,
  ...RM_VALLADER_VERBS,
};
