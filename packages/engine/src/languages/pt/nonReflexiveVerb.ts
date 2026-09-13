import type { ConceptForms } from '../../types.js';

/**
 * A pronominal verb with its clitic taken off, so its forms can be derived as a plain verb's: "-se"
 * off the base ("tornar-se" → "tornar") and the leading clitic off every stored form ("me torno" →
 * "torno"). The caller places the clitic for its own person. Any other verb is returned as it is.
 */
export function nonReflexiveVerb(verb: ConceptForms): ConceptForms {
  const base = verb.forms['base'] ?? '';
  if (!base.endsWith('-se')) return verb;
  const forms = Object.fromEntries(
    Object.entries(verb.forms).map(([key, value]) => [key, key === 'base' ? value.slice(0, -3) : value.replace(/^(?:me|te|se|nos|vos) /, '')]),
  );
  return { ...verb, forms };
}
