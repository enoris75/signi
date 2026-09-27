import type { ConceptForms } from '../../types.js';

// The clitic a cell starts with: *am, at, as, ans* and a space, or the elided *m', t', s'*.
const CLITIC = /^(?:(?:am|at|as|ans) |[mts]')/;
// The enclitic the column writes on an imperative: *ferma't*, *fermain'ans*, *fermai'as*.
const ENCLITIC = /'(?:t|ans|as)$/;

/** Whether the verb is reflexive: its lexeme stores the clitic on the base, *as fermar*, *s'algordar*. */
export function isReflexive(verbForms: Record<string, string>): boolean {
  return /^(?:as |s')/.test(verbForms['base'] ?? '');
}

/**
 * A reflexive verb with its clitic taken off, so its forms can be placed as a plain verb's: *as* off
 * the base ("as fermar" → "fermar"), the person's clitic off every finite cell ("am ferm" → "ferm",
 * "m'algord" → "algord") and the enclitic off the imperatives ("ferma't" → "ferma"). A reflexive verb
 * selects *esser* (the lexeme says so too). The caller places the clitic for its own person
 * (`reflexiveClitic`). Any other verb is returned as it is.
 */
export function nonReflexiveVerb(verb: ConceptForms): ConceptForms {
  if (!isReflexive(verb.forms)) return verb;
  const forms: Record<string, string> = Object.fromEntries(
    Object.entries(verb.forms).map(([key, value]) => [key, value.replace(CLITIC, '').replace(ENCLITIC, '')]),
  );
  forms['aux'] = 'be';
  return { ...verb, forms };
}
