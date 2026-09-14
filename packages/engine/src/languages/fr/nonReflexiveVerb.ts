import type { ConceptForms } from '../../types.js';

/**
 * A pronominal verb with its clitic taken off, so its forms can be derived as a plain verb's: "s'" /
 * "se " off the base ("s'effondrer" → "effondrer") and the leading clitic off every stored form
 * ("m'effondrerai" → "effondrerai", "nous effondrons" → "effondrons"). The caller places the clitic
 * for its own person (`reflexiveFinite`). Any other verb is returned as it is.
 */
export function nonReflexiveVerb(verb: ConceptForms): ConceptForms {
  const base = verb.forms['base'] ?? '';
  if (!/^(?:s'|se )/.test(base)) return verb;
  const forms = Object.fromEntries(
    Object.entries(verb.forms).map(([key, value]) => [key, value.replace(/^(?:[mts]'|(?:me|te|se|nous|vous) )/, '')]),
  );
  return { ...verb, forms };
}
