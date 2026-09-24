import type { IndefiniteSpeller } from '../../translator/translator.types.js';

/**
 * Portuguese postposes an adjective on an indefinite pronoun, in the masculine singular: *algo
 * grande*, *nada novo*, *alguém novo* (P09-E36). OTHER is *mais* after a pronoun where the pronoun
 * has no phrase of its own for it; SOMETHING and SOMEONE both do (`with_other`: *outra coisa*,
 * *outra pessoa*), so the fallback is for a pronoun seeded later.
 */
export const indefiniteModifierPt: IndefiniteSpeller = (surface, _citation, adjective) =>
  `${surface} ${adjective.forms['after_pronoun'] ?? adjective.forms['base'] ?? ''}`;
