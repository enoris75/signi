import { compileSeedDefinitions, type DefinedConceptSeed } from './definitionText.js';
import { pronouns } from './pronouns.js';
import { nouns } from './nouns.js';
import { verbs } from './verbs/index.js';
import { adjectives } from './adjectives.js';
import { adverbs } from './adverbs.js';
import { interjections } from './interjections.js';
import { GSW } from './gsw/index.js';
import type { ConceptSeed } from './types.js';

/**
 * Each seed with its Swiss German forms folded in as `forms.gsw` (P10-E4): the column lives in
 * `gsw/`, keyed by concept id, and an entry naming no seeded concept is refused here rather than
 * silently dropped.
 */
function withSwissGerman(seeds: ConceptSeed[]): ConceptSeed[] {
  const ids = new Set(seeds.map((c) => c.id));
  const stray = Object.keys(GSW).filter((id) => !ids.has(id));
  if (stray.length > 0) throw new Error(`gsw forms for unknown concept${stray.length > 1 ? 's' : ''}: ${stray.join(', ')}`);
  return seeds.map((c) => (GSW[c.id] ? { ...c, forms: { ...c.forms, gsw: GSW[c.id]! } } : c));
}

// Every seed, with each definition written in the phrase language compiled to its plan (P13).
export const concepts: DefinedConceptSeed[] = compileSeedDefinitions(withSwissGerman([
  ...pronouns,
  ...nouns,
  ...verbs,
  ...adjectives,
  ...adverbs,
  ...interjections,
]));

export { NONFINITE } from './verbs/index.js';
export type { ConceptSeed } from './types.js';
export { GSW, GSW_PENDING } from './gsw/index.js';
export type { DefinedConceptSeed } from './definitionText.js';
