import type { LanguageColumn } from '../types.js';
import { RM_SURSILV_PRONOUNS } from './pronouns.js';
import { RM_SURSILV_INTERJECTIONS } from './interjections.js';
import { RM_SURSILV_NOUNS } from './nouns.js';
import { RM_SURSILV_ADJECTIVES } from './adjectives.js';
import { RM_SURSILV_ADVERBS } from './adverbs.js';
import { RM_SURSILV_VERBS } from './verbs.js';

/**
 * The Sursilvan column (`rm-sursilv`, P04), keyed by concept id and merged into each concept as
 * `forms['rm-sursilv']` by `concepts/index.ts`, the shape of the Swiss German column (P10-E4). Every
 * form is *(verify)* until the variety's review (P04-E19). A concept left out borrows its closest
 * language's forms at merge time (`columns.ts`) — never a gap in the row.
 */
export const RM_SURSILV: LanguageColumn = {
  ...RM_SURSILV_PRONOUNS,
  ...RM_SURSILV_INTERJECTIONS,
  ...RM_SURSILV_NOUNS,
  ...RM_SURSILV_ADJECTIVES,
  ...RM_SURSILV_ADVERBS,
  ...RM_SURSILV_VERBS,
};
