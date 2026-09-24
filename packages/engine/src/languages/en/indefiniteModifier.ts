import type { IndefiniteSpeller } from '../../translator/translator.types.js';

/**
 * English postposes an adjective on an indefinite pronoun — *something big*, *nothing new*,
 * *someone important* — and writes OTHER there as *else*: *something else*, *nobody else*
 * (P09-E36).
 */
export const indefiniteModifierEn: IndefiniteSpeller = (surface, _citation, adjective) =>
  `${surface} ${adjective.forms['after_pronoun'] ?? adjective.forms['base'] ?? ''}`;
