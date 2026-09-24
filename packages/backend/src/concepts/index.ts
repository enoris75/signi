import { compileSeedDefinitions, type DefinedConceptSeed } from './definitionText.js';
import { pronouns } from './pronouns.js';
import { nouns } from './nouns.js';
import { verbs } from './verbs/index.js';
import { adjectives } from './adjectives.js';
import { adverbs } from './adverbs.js';
import { interjections } from './interjections.js';

// Every seed, with each definition written in the phrase language compiled to its plan (P13).
export const concepts: DefinedConceptSeed[] = compileSeedDefinitions([
  ...pronouns,
  ...nouns,
  ...verbs,
  ...adjectives,
  ...adverbs,
  ...interjections,
]);

export { NONFINITE } from './verbs/index.js';
export type { ConceptSeed } from './types.js';
export type { DefinedConceptSeed } from './definitionText.js';
