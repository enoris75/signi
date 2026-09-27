import { compileSeedDefinitions, type DefinedConceptSeed } from './definitionText.js';
import { pronouns } from './pronouns.js';
import { nouns } from './nouns.js';
import { verbs } from './verbs/index.js';
import { adjectives } from './adjectives.js';
import { adverbs } from './adverbs.js';
import { interjections } from './interjections.js';
import { COLUMNS } from './columns.js';
import { ANTONYMS, SYNONYMS, assertValidLexicalRelations } from './relations.js';
import type { LanguageCode } from '@signi/shared';
import type { ConceptSeed } from './types.js';

/** Per column, the concepts whose forms it borrowed from its closest language (see `COLUMNS`). */
export const BORROWED: Partial<Record<LanguageCode, string[]>> = {};

/**
 * Each seed with the preview languages' columns folded in as `forms[code]` (P10-E4, P04-E1): each
 * column lives in its language's folder, keyed by concept id, and an entry naming no seeded concept
 * is refused here rather than silently dropped. A concept the column does not give borrows its
 * closest language's forms, so no word is ever missing, and is recorded in `BORROWED`.
 */
function withColumns(seeds: ConceptSeed[]): ConceptSeed[] {
  const ids = new Set(seeds.map((c) => c.id));
  let merged = seeds;
  for (const [code, { forms, closest }] of Object.entries(COLUMNS) as [LanguageCode, NonNullable<(typeof COLUMNS)[LanguageCode]>][]) {
    const stray = Object.keys(forms).filter((id) => !ids.has(id));
    if (stray.length > 0) throw new Error(`${code} forms for unknown concept${stray.length > 1 ? 's' : ''}: ${stray.join(', ')}`);
    const borrowed: string[] = [];
    merged = merged.map((c) => {
      const own = forms[c.id];
      const lent = own ? undefined : c.forms[closest];
      if (!own && !lent) return c;
      if (lent) borrowed.push(c.id);
      return { ...c, forms: { ...c.forms, [code]: own ?? lent! } };
    });
    BORROWED[code] = borrowed;
  }
  return merged;
}

/**
 * Each seed with its antonyms and synonyms folded in from the pairs in `relations.ts`, both ends of
 * a pair naming the other. The pairs are checked first, so one naming no seeded concept, or joining
 * two roles, fails here rather than as a foreign key in the middle of the seed.
 */
function withRelations(seeds: ConceptSeed[]): ConceptSeed[] {
  assertValidLexicalRelations(seeds);
  const ends = (pairs: typeof ANTONYMS, id: string) =>
    pairs.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));
  return seeds.map((c) => {
    const antonyms = ends(ANTONYMS, c.id);
    const synonyms = ends(SYNONYMS, c.id);
    if (antonyms.length === 0 && synonyms.length === 0) return c;
    return {
      ...c,
      ...(antonyms.length > 0 && { antonyms }),
      ...(synonyms.length > 0 && { synonyms }),
    };
  });
}

// Every seed, with each definition written in the phrase language compiled to its plan (P13).
export const concepts: DefinedConceptSeed[] = compileSeedDefinitions(withRelations(withColumns([
  ...pronouns,
  ...nouns,
  ...verbs,
  ...adjectives,
  ...adverbs,
  ...interjections,
])));

export { NONFINITE } from './verbs/index.js';
export type { ConceptSeed } from './types.js';
export { GSW } from './gsw/index.js';
export { RM_RUMGR } from './rm-rumgr/index.js';
export { RM_SURSILV } from './rm-sursilv/index.js';
export { RM_VALLADER } from './rm-vallader/index.js';
export { CA } from './ca/index.js';
export { COLUMNS } from './columns.js';
export type { DefinedConceptSeed } from './definitionText.js';
