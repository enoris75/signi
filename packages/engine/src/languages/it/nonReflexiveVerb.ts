import type { ConceptForms } from '../../types.js';

/**
 * A pronominal verb with its clitic taken off, so its forms can be derived and placed as a plain
 * verb's: "-si" off the base, which restores the infinitive ("muoversi" → "muovere", "porsi" →
 * "porre"), and off the gerund ("muovendosi" → "muovendo"), and the leading clitic off every finite
 * form ("si muove" → "muove", "ci muoviamo" → "muoviamo"). A pronominal verb always selects essere, so
 * the plain verb carries `aux: 'be'` ("si è mosso"). The caller places the clitic for its own person
 * (`reflexiveClitic`). Any other verb is returned as it is.
 */
export function nonReflexiveVerb(verb: ConceptForms): ConceptForms {
  const base = verb.forms['base'] ?? '';
  if (!base.endsWith('rsi')) return verb;
  const stem = base.slice(0, -2);
  // The contracted infinitives (porre, tradurre, trarre) lost their -e- before the -re.
  const infinitive = /(?:por|dur|trar)$/.test(stem) ? `${stem}re` : `${stem}e`;
  const forms: Record<string, string> = Object.fromEntries(
    Object.entries(verb.forms).map(([key, value]) => [key, value.replace(/^(?:mi|ti|si|ci|vi) /, '')]),
  );
  forms['base'] = infinitive;
  if (forms['gerund']) forms['gerund'] = forms['gerund'].replace(/si$/, '');
  forms['aux'] = 'be';
  return { ...verb, forms };
}
