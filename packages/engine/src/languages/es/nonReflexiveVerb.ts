import type { ConceptForms } from '../../types.js';

/**
 * A reflexive verb with its clitic taken off, so its forms can be derived as a plain verb's: "-se"
 * off the base ("volverse" → "volver") and the leading clitic off every stored form ("se vuelve" →
 * "vuelve", "me vuelvo" → "vuelvo"). The caller places the clitic for its own person. Any other verb
 * is returned as it is.
 */
export function nonReflexiveVerb(verb: ConceptForms): ConceptForms {
  const base = verb.forms['base'] ?? '';
  if (!base.endsWith('se')) return verb;
  const forms = Object.fromEntries(
    Object.entries(verb.forms).map(([key, value]) => [key, key === 'base' ? value.slice(0, -2) : value.replace(/^(?:me|te|se|nos|os) /, '')]),
  );
  return { ...verb, forms };
}
