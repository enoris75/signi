import type { LanguageColumn } from '../types.js';
import { PL_PRONOUNS } from './pronouns.js';
import { PL_INTERJECTIONS } from './interjections.js';
import { PL_NOUNS_A } from './nouns-a.js';
import { PL_NOUNS_B } from './nouns-b.js';
import { PL_NOUNS_C } from './nouns-c.js';
import { PL_ADJECTIVES } from './adjectives.js';
import { PL_ADVERBS } from './adverbs.js';
import { PL_VERBS_A } from './verbs-a.js';
import { PL_VERBS_B } from './verbs-b.js';

/**
 * The Polish column (`pl`, P05), standard written Polish, keyed by concept id and merged into each
 * concept as `forms.pl` by `concepts/index.ts`. The keys are in style-pl.md: nouns carry their case
 * paradigm, verbs both aspects (`pf_` for the perfective, P05 D1). Every form is *(verify)* until the
 * native review. A concept left out borrows German's forms at merge time (`columns.ts`).
 */
export const PL: LanguageColumn = {
  ...PL_PRONOUNS,
  ...PL_INTERJECTIONS,
  ...PL_NOUNS_A,
  ...PL_NOUNS_B,
  ...PL_NOUNS_C,
  ...PL_ADJECTIVES,
  ...PL_ADVERBS,
  ...PL_VERBS_A,
  ...PL_VERBS_B,
};
