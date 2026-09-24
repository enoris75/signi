import type { IndefiniteSpeller } from '../../translator/translator.types.js';

/**
 * Spanish postposes an adjective on an indefinite pronoun, in the masculine singular: *algo
 * grande*, *nada nuevo*, *alguien importante* (P09-E36). OTHER is *más* after a pronoun (*alguien
 * más*, *nadie más*), except where the pronoun has a phrase of its own for it (SOMETHING's
 * `with_other`, *otra cosa*), which never reaches here.
 */
export const indefiniteModifierEs: IndefiniteSpeller = (surface, _citation, adjective) =>
  `${surface} ${adjective.forms['after_pronoun'] ?? adjective.forms['base'] ?? ''}`;
