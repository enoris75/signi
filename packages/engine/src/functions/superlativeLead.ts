import type { ConceptForms } from '../types.js';

/**
 * Split a superlative's intensifier off the adjective, for a site that writes the superlative's
 * article: that intensifier is a phrase standing **before** the article — "by far the biggest", "di
 * gran lunga il più grande", "de loin le plus grand", "con mucho el más grande", "de longe o maior" —
 * not between the article and the degree word, where `withIntensifier` would put it (A257).
 *
 * `lead` is the phrase, '' when the adjective carries none (or a plain one, such as English
 * attributive "the very biggest"), and `adjective` is what to render after the article: the same
 * forms without the intensifier, or the adjective itself when there is nothing to split. A site with
 * no article of its own (German "bei weitem am größten", Japanese 断然最も大きい) needs none of this.
 */
export function superlativeLead(a: ConceptForms): { lead: string; adjective: ConceptForms } {
  const lead = a.forms['intensifier_superlative'] === '1' ? a.forms['intensifier'] ?? '' : '';
  if (!lead) return { lead: '', adjective: a };
  const forms = { ...a.forms };
  for (const key of ['intensifier', 'intensifier_position', 'intensifier_reading', 'intensifier_superlative']) delete forms[key];
  return { lead, adjective: { ...a, forms } };
}
