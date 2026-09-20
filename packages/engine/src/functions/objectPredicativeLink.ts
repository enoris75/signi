import type { ConceptForms } from '../types.js';

/**
 * The word a verb links its *factitive* object predicative with — "transform the period **into** a
 * command", it "in", fr/es "en", pt "em", de "in", ja "に". Like `infinitive_link` it is lexical,
 * a property of the governing verb rather than of the construction (English "make X a Y" takes
 * none where "turn X into Y" takes one), so the verb's lexeme names it as
 * `object_predicative_link`; "" is the bare predicate. The essive reading ("**as** the condition")
 * does not read this — its word is the language's own.
 */
export function objectPredicativeLink(verb: ConceptForms['forms'] = {}): string {
  return verb['object_predicative_link'] ?? '';
}
