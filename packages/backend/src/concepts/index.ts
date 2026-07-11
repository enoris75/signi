import type { ConceptSeed } from './types.js';
import { pronouns } from './pronouns.js';
import { nouns } from './nouns.js';
import { verbs } from './verbs/index.js';
import { adjectives } from './adjectives.js';
import { adverbs } from './adverbs.js';

export const concepts: ConceptSeed[] = [
  ...pronouns,
  ...nouns,
  ...verbs,
  ...adjectives,
  ...adverbs,
];

export { NONFINITE } from './verbs/index.js';
export type { ConceptSeed } from './types.js';
