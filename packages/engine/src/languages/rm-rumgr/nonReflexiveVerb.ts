import type { ConceptForms } from '../../types.js';

const CLITIC = /^(?:ma|ta|sa|ans|as) /;
const ENCLITIC = /-(?:ta|ans|as)$/;

/** Whether the verb is reflexive: its lexeme stores the clitic on the base, *sa tschentar* (P04-E4). */
export function isReflexive(verbForms: Record<string, string>): boolean {
  return (verbForms['base'] ?? '').startsWith('sa ');
}

/**
 * A reflexive verb with its clitic taken off, so its forms can be placed as a plain verb's: *sa* off
 * the base ("sa tschentar" → "tschentar"), the person's clitic off every finite cell ("ma tschent" →
 * "tschent") and the hyphenated enclitic off the imperatives ("tschenta-ta" → "tschenta"). A reflexive
 * verb selects *esser* (the lexeme says so too). The caller places the clitic for its own person
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
