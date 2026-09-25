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

/**
 * A seed whose definition, if it has one, is a plan — what `concepts` hands every consumer — with the
 * text it was compiled from, which the console opens on the canvas (`/define`).
 */
export type DefinedConceptSeed = Omit<ConceptSeed, 'definition'> & { definition?: PhrasePlan; definitionText?: string };

/**
 * A seed as the pickers and the console see it (`/api/concepts`), read off the seed itself rather
 * than the database it is written to: the facts the phrase language checks a line against — a word's
 * role, a verb's transitivity, the complements and the clause it licenses, a pronoun's person and
 * number, whether a noun has a feminine. `listConcepts` serves the same from the database, and a test
 * holds the two to each other.
 */
/**
 * The force a verb's that-clause may have (P09-E55, `Concept.clauseForce`), read off its lexemes'
 * `content_clause_force`. The canvas builds one plan for all seven languages, so a verb whose
 * languages disagree (one takes a question, another only a statement) would let a control reach one
 * language's refusal: that is a seed error, thrown here.
 */
export function clauseForceOf(seed: Pick<ConceptSeed, 'id' | 'role' | 'forms'>): Concept['clauseForce'] {
  if (seed.role !== 'verb') return undefined;
  const forces = new Set(Object.values(seed.forms).map((f) => (f as Record<string, string>)['content_clause_force']));
  if (forces.size > 1) throw new Error(`${seed.id}'s content_clause_force differs between its languages (P09-E55)`);
  const [force] = forces;
  return force === 'interrogative' || force === 'either' ? force : undefined;
}

export function seedConcept(seed: Omit<ConceptSeed, 'definition'>): Concept {
  const clauseForce = clauseForceOf(seed);
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
    ...(clauseForce ? { clauseForce } : {}),
    ...(seed.role === 'verb' && Object.values(seed.forms).some((f) => 'object_prep' in f) ? { prepositionalObject: true } : {}),
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
 * A definition as a seed file writes it: one period a line, the lines of a linked definition indented
 * in a template literal with the code around it. The indentation and the blank lines around it are
 * the file's, not the definition's.
 */
export function definitionLines(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * The seeds with each definition written in the phrase language (P13) compiled to its plan, against
 * a vocabulary of every seed by id. A definition that does not compile throws here — on import, so
 * at boot and in every test that loads the corpus — naming the concept, the reason and the line.
 */
export function compileSeedDefinitions(seeds: readonly ConceptSeed[]): DefinedConceptSeed[] {
  const vocab = definitionVocabulary(seeds.map(seedConcept));
  return seeds.map(({ definition, ...seed }) => {
    if (definition === undefined) return seed;
    try {
      const text = definitionLines(definition);
      return { ...seed, definition: compileDefinition(text, vocab), definitionText: text };
    } catch (e) {
      if (!(e instanceof DefinitionError)) throw e;
      throw new Error(`Definition for "${seed.id}" does not compile: ${e.reason}\n  in: ${e.text}`);
    }
  });
}
