import type { IndefiniteSpeller } from '../../translator/translator.types.js';
import { VOWEL_START } from './fr.consts.js';

/**
 * French links an adjective to an indefinite pronoun with *de*, in the masculine singular, eliding
 * before a vowel: *quelque chose de grand*, *rien de nouveau*, *quelqu'un d'important* (P09-E36).
 * OTHER takes the same *de* — *quelqu'un d'autre*, *rien d'autre* — except where the pronoun has a
 * word of its own for it (*autre chose*, SOMETHING's `with_other`), which never reaches here.
 */
export const indefiniteModifierFr: IndefiniteSpeller = (surface, _citation, adjective) => {
  const word = adjective.forms['after_pronoun'] ?? adjective.forms['base'] ?? '';
  return `${surface} ${VOWEL_START.test(word) ? `d'${word}` : `de ${word}`}`;
};
