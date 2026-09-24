import type {
  ClauseObject,
  ComplementType,
  Concept,
  ConceptSlot,
  DimensionRelation,
  GrammaticalRole,
  MannerRelation,
  PhrasePlan,
  Transitivity,
} from '@signi/shared';
import { compileDefinition, DefinitionError, definitionVocabulary } from '@signi/phrase';
import type { ConceptSeed } from './types.js';

/** A seed whose definition, if it has one, is a plan — what `concepts` hands every consumer. */
export type DefinedConceptSeed = ConceptSeed & { definition?: PhrasePlan };

/**
 * A seed as the pickers and the console see it (`/api/concepts`), read off the seed itself rather
 * than the database it is written to: the facts the phrase language checks a line against — a word's
 * role, a verb's transitivity, the complements and the clause it licenses, a pronoun's person and
 * number, whether a noun has a feminine. `listConcepts` serves the same from the database, and a test
 * holds the two to each other.
 */
export function seedConcept(seed: ConceptSeed): Concept {
  const en = seed.forms['en'] ?? {};
  const pronoun = seed.role === 'pronoun';
  return {
    id: seed.id,
    role: seed.role as GrammaticalRole,
    description: seed.description,
    ...((en['base'] ?? en['singular']) ? { label: en['base'] ?? en['singular'] } : {}),
    ...(seed.transitivity ? { transitivity: seed.transitivity as Transitivity } : {}),
    ...(seed.complements ? { complements: seed.complements as ComplementType[] } : {}),
    ...(seed.clauseObject ? { clauseObject: seed.clauseObject as ClauseObject } : {}),
    ...(seed.modal ? { modal: true } : {}),
    ...(seed.slot ? { slot: seed.slot as ConceptSlot } : {}),
    ...(pronoun ? { person: (en['person'] ?? '3') as '1' | '2' | '3', number: (en['number'] ?? 'singular') as 'singular' | 'plural' } : {}),
    ...(seed.role === 'noun' && Object.values(seed.forms).some((f) => 'fem' in f) ? { gendered: true } : {}),
    ...(seed.human ? { human: true } : {}),
    ...(seed.mannerRelation ? { mannerRelation: seed.mannerRelation as MannerRelation } : {}),
    ...(seed.dimensionRelation ? { dimensionRelation: seed.dimensionRelation as DimensionRelation } : {}),
  };
}

/**
 * The seeds with each definition written in the phrase language (P13) compiled to its plan, against
 * a vocabulary of every seed by id. A definition that does not compile throws here — on import, so
 * at boot and in every test that loads the corpus — naming the concept, the reason and the line.
 */
export function compileSeedDefinitions(seeds: readonly ConceptSeed[]): DefinedConceptSeed[] {
  if (!seeds.some((s) => typeof s.definition === 'string')) return seeds as DefinedConceptSeed[];
  const vocab = definitionVocabulary(seeds.map(seedConcept));
  return seeds.map((seed) => {
    if (typeof seed.definition !== 'string') return seed as DefinedConceptSeed;
    try {
      return { ...seed, definition: compileDefinition(seed.definition, vocab) };
    } catch (e) {
      if (!(e instanceof DefinitionError)) throw e;
      throw new Error(`Definition for "${seed.id}" does not compile: ${e.reason}\n  in: ${e.text}`);
    }
  });
}
