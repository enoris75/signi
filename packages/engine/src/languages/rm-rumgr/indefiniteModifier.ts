import type { IndefiniteSpeller } from '../../translator/translator.types.js';

/**
 * Rumantsch Grischun puts the adjective straight after an indefinite pronoun, in the masculine
 * singular: *insatge grond*, *nagut nov*, *insatgi impurtant* (P09-E36, verify — no linking *da*).
 * OTHER fuses with the pronoun instead (*insatge auter*, *nagin auter*), a form each pronoun carries as
 * `with_other`; only a pronoun without one reaches here with it, and takes it after.
 */
export const indefiniteModifierRumgr: IndefiniteSpeller = (surface, _citation, adjective) => {
  const after = adjective.forms['after_pronoun'];
  return `${surface} ${after ?? adjective.forms['base'] ?? ''}`;
};
