import type { ConceptForms } from '../types.js';

/**
 * The preposition a verb's object takes, or "" for a plain direct object (A139). It is lexical, so the
 * verb's lexeme names it (`object_prep`): one clicks ON a thing in Italian, French, German, Spanish and
 * Portuguese ("clicca sul pulsante", "klickt auf die Taste"), where English and Japanese take it bare.
 * The object stays the verb's patient in the plan; each engine gives it the preposition, with the
 * article contraction and case a complement would take, and never makes it a clitic.
 */
export function objectPreposition(verb: ConceptForms): string {
  return verb.forms['object_prep'] ?? '';
}
