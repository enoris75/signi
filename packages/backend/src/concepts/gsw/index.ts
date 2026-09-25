import type { GswColumn } from './types.js';
import { GSW_PRONOUNS } from './pronouns.js';
import { GSW_INTERJECTIONS } from './interjections.js';
import { GSW_NOUNS_1 } from './nouns1.js';
import { GSW_NOUNS_2 } from './nouns2.js';
import { GSW_NOUNS_3 } from './nouns3.js';
import { GSW_VERBS_TRANSITIVE } from './verbsTransitive.js';
import { GSW_VERBS_OTHER } from './verbsOther.js';
import { GSW_ADJECTIVES } from './adjectives.js';
import { GSW_ADVERBS } from './adverbs.js';

/**
 * The Swiss German column (P10-E4), keyed by concept id. See `types.ts` for what an entry holds and
 * what it leaves out.
 */
export const GSW: GswColumn = {
  ...GSW_PRONOUNS,
  ...GSW_INTERJECTIONS,
  ...GSW_NOUNS_1,
  ...GSW_NOUNS_2,
  ...GSW_NOUNS_3,
  ...GSW_VERBS_TRANSITIVE,
  ...GSW_VERBS_OTHER,
  ...GSW_ADJECTIVES,
  ...GSW_ADVERBS,
};

/**
 * The concepts seeded without a Swiss German form (P10-E4 D2): while `gsw` is a preview language a
 * seeder who cannot supply a Zürich word leaves it out — never a copied German form, which would
 * lie — and names the concept here, so the gap is a list someone can work through rather than a
 * silence. Each renders the `gsw` row empty (P10-E1 D1). Empty today: the column is complete.
 */
export const GSW_PENDING: readonly string[] = [];

export type { GswColumn, GswForms } from './types.js';
