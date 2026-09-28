import type { LanguageColumn } from '../types.js';
import { LT_PRONOUNS } from './pronouns.js';
import { LT_INTERJECTIONS } from './interjections.js';
import { LT_NOUNS_A } from './nouns-a.js';
import { LT_NOUNS_B } from './nouns-b.js';
import { LT_NOUNS_C } from './nouns-c.js';
import { LT_ADJECTIVES } from './adjectives.js';
import { LT_ADVERBS } from './adverbs.js';
import { LT_VERBS_A } from './verbs-a.js';
import { LT_VERBS_B } from './verbs-b.js';

/**
 * The Lithuanian column (`lt`, P18), standard Lithuanian in the VLKK norms (P18 D1), keyed by concept
 * id and merged into each concept as `forms.lt` by `concepts/index.ts`. The keys are Polish's where the
 * languages agree (style-lt.md): nouns carry their case paradigm, verbs both aspects (`pf_`). Every form
 * is *(verify)* until the native review (P18-E12). A concept left out borrows Polish's forms at merge
 * time (`columns.ts`).
 */
export const LT: LanguageColumn = {
  ...LT_PRONOUNS,
  ...LT_INTERJECTIONS,
  ...LT_NOUNS_A,
  ...LT_NOUNS_B,
  ...LT_NOUNS_C,
  ...LT_ADJECTIVES,
  ...LT_ADVERBS,
  ...LT_VERBS_A,
  ...LT_VERBS_B,
};
