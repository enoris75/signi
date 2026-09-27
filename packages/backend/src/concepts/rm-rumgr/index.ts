import type { LanguageColumn } from '../types.js';
import { RM_RUMGR_PRONOUNS } from './pronouns.js';
import { RM_RUMGR_INTERJECTIONS } from './interjections.js';
import { RM_RUMGR_NOUNS } from './nouns.js';
import { RM_RUMGR_ADJECTIVES } from './adjectives.js';
import { RM_RUMGR_ADVERBS } from './adverbs.js';
import { RM_RUMGR_VERBS } from './verbs.js';

/**
 * The Rumantsch Grischun column (`rm-rumgr`, P04), keyed by concept id and merged into each concept as
 * `forms['rm-rumgr']` by `concepts/index.ts`, the shape of the Swiss German column (P10-E4). Every
 * form is *(verify)* until the variety's review (P04-E19). A concept left out borrows its closest
 * language's forms at merge time (`columns.ts`) — never a gap in the row.
 */
export const RM_RUMGR: LanguageColumn = {
  ...RM_RUMGR_PRONOUNS,
  ...RM_RUMGR_INTERJECTIONS,
  ...RM_RUMGR_NOUNS,
  ...RM_RUMGR_ADJECTIVES,
  ...RM_RUMGR_ADVERBS,
  ...RM_RUMGR_VERBS,
};
