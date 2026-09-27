import type { ConceptForms } from '../../types.js';

const PROCLITIC = /^(?:(?:em|et|es|ens|us) |[mts]')/;
const ENCLITIC = /(?:-se|'s)$/;

/** Whether the verb is pronominal: its lexeme stores the enclitic on the base, *tornar-se, moure's*. */
export function isReflexive(verbForms: Record<string, string>): boolean {
  return ENCLITIC.test(verbForms['base'] ?? '');
}

/**
 * A pronominal verb with its clitic taken off, so its forms can be placed as a plain verb's: the
 * enclitic off the base ("tornar-se" → "tornar", "moure's" → "moure") and the proclitic off every
 * finite cell ("es torna" → "torna", "m'aturo" → "aturo"). The caller places the clitic for its own
 * person (`reflexiveClitic`). Any other verb is returned as it is.
 */
export function nonReflexiveVerb(verb: ConceptForms): ConceptForms {
  if (!isReflexive(verb.forms)) return verb;
  const forms = Object.fromEntries(
    Object.entries(verb.forms).map(([key, value]) => [key, key === 'base' ? value.replace(ENCLITIC, '') : value.replace(PROCLITIC, '')]),
  );
  return { ...verb, forms };
}
