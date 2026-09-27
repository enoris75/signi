import type { IndefiniteSpeller } from '../../translator/translator.types.js';

/**
 * Vallader puts the adjective straight after an indefinite pronoun, in the masculine singular: *alch
 * grond*, *nöglia nouv*, *qualchün important* (P09-E36, the author's draft, verify — no linking *da*).
 * OTHER fuses with the pronoun instead (*alch oter*, *ingün oter*), a form each pronoun carries as
 * `with_other`; only a pronoun without one reaches here with it, and takes it after.
 */
export const indefiniteModifierVallader: IndefiniteSpeller = (surface, _citation, adjective) => {
  const after = adjective.forms['after_pronoun'];
  return `${surface} ${after ?? adjective.forms['base'] ?? ''}`;
};
