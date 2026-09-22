import type { ResolvedNounPhrase } from '../../types.js';
import { npText } from './npText.js';
import { prepObjectText } from './prepObjectText.js';
import { takesPersonalA } from './takesPersonalA.js';

/**
 * One noun conjunct of a direct object. A human with a determiner takes the personal "a", fused
 * with it as the dative "a" is ("ve al niño", "a la mujer", "a un hombre", "a ningún niño", "a su
 * padre"). A bare human is non-specific and takes none ("busca niños"), and every non-human keeps
 * the plain noun phrase ("ve el perro") — unless its verb marks every object so (`object_a`, see
 * `takesPersonalA`): "sigue al primer objeto".
 */
export function objectNounText(np: ResolvedNounPhrase, verbForms: Record<string, string> = {}): string {
  return takesPersonalA(np, verbForms) ? prepObjectText(np, 'a') : npText(np);
}
