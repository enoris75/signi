import type { IndefiniteSpeller } from '../../translator/translator.types.js';

/**
 * Catalan postposes an adjective on an indefinite pronoun, in the masculine singular: *alguna cosa
 * gran*, *algú important* (P09-E36); after the negative *res* it takes *de*: *res de nou* (verify).
 * OTHER is *més* after a pronoun (*algú més*, *ningú més*) where the pronoun has no phrase of its own
 * for it (SOMETHING's `with_other`, *una altra cosa*).
 */
export const indefiniteModifierCa: IndefiniteSpeller = (surface, _citation, adjective) => {
  const word = adjective.forms['after_pronoun'] ?? adjective.forms['base'] ?? '';
  return surface === 'res' && !adjective.forms['after_pronoun'] ? `res de ${word}` : `${surface} ${word}`;
};
