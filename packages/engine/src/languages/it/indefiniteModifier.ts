import type { IndefiniteSpeller } from '../../translator/translator.types.js';

/**
 * Italian links an adjective to an indefinite pronoun with *di*, in the masculine singular:
 * *qualcosa di grande*, *niente di nuovo*, *qualcuno di importante* (P09-E36). OTHER fuses with the
 * pronoun instead (*qualcos'altro*, *qualcun altro*, *nessun altro*), a form each pronoun carries
 * as `with_other`; only a pronoun without one reaches here with it, and takes it plainly after.
 */
export const indefiniteModifierIt: IndefiniteSpeller = (surface, _citation, adjective) => {
  const after = adjective.forms['after_pronoun'];
  return after ? `${surface} ${after}` : `${surface} di ${adjective.forms['base'] ?? ''}`;
};
