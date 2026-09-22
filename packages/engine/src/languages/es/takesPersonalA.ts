import type { ResolvedNounPhrase } from '../../types.js';

/**
 * Whether a direct-object noun conjunct takes the personal "a": a human with a determiner ("al
 * niño", "a un hombre", "a su padre"). A bare human is non-specific and takes none ("busca niños").
 *
 * A verb whose lexeme says `object_a` marks every determined object that way, human or not: seguir
 * in its sense of order, "sigue al primer objeto" (localization C24). It is still a direct object,
 * unlike an `object_prep` one (A139), so a pronoun stays the clitic: "lo sigue".
 */
export function takesPersonalA(np: ResolvedNounPhrase, verbForms: Record<string, string> = {}): boolean {
  return (np.head.forms['human'] === '1' || verbForms['object_a'] === '1') && np.head.forms['definiteness'] !== 'bare';
}
