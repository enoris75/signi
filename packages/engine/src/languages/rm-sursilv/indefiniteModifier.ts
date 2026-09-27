import type { IndefiniteSpeller } from '../../translator/translator.types.js';

/**
 * Sursilvan puts the adjective straight after an indefinite pronoun, in the masculine singular:
 * *enzatgei grond*, *nuot niev*, *enzatgi impurtont* (P09-E36, verify — no linking *da*). OTHER fuses
 * with the pronoun instead (*enzatgei auter*, *negin auter*), a form each pronoun carries as
 * `with_other`; only a pronoun without one reaches here with it, and takes it after.
 */
export const indefiniteModifierSursilv: IndefiniteSpeller = (surface, _citation, adjective) => {
  const after = adjective.forms['after_pronoun'];
  return `${surface} ${after ?? adjective.forms['base'] ?? ''}`;
};
