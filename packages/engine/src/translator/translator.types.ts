import type { LexicalEntry } from '@signi/shared';
import type { ConceptForms } from '../types.js';

export type LexiconLookup = (conceptId: string, language: string) => LexicalEntry | undefined;

/**
 * The surface slots of an indefinite pronoun a modifier is folded into (P09-E36): the citation /
 * subject form, the direct object's, and the tonic one a preposition takes.
 */
export type IndefiniteKey = 'base' | 'object' | 'disjunctive';

/**
 * How one language writes an adjective on an indefinite pronoun (P09-E36): *something big*,
 * *qualcosa di grande*, *etwas Großes*. `surface` is the pronoun's form in the slot `key` names,
 * `citation` its nominative (German's pronoun stays undeclined before the adjectival noun), and
 * `adjective` the one resolved adjective. OTHER (which carries `after_pronoun`) comes here too
 * when the pronoun has no fused form of its own (`with_other`).
 */
export type IndefiniteSpeller = (surface: string, citation: string, adjective: ConceptForms, key: IndefiniteKey) => string;
