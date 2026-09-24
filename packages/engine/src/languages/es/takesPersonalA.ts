import type { ResolvedNounPhrase } from '../../types.js';

/**
 * Whether a direct-object noun conjunct takes the personal "a": a human with a determiner ("al
 * niño", "a un hombre", "a su padre"). A bare human is non-specific and takes none ("busca niños"), but a counted one is not bare
 * ("ve a dos amigos", A340).
 *
 * A verb whose lexeme says `object_a` marks every determined object that way, human or not: seguir
 * in its sense of order, "sigue al primer objeto" (localization C24). It is still a direct object,
 * unlike an `object_prep` one (A139), so a pronoun stays the clitic: "lo sigue".
 *
 * `object_no_a` is the opposite flag, and *tener* is the verb that needs it: the personal "a" marks
 * the person an act reaches, and having somebody is not doing anything to them — "tiene los mismos
 * padres", "tengo dos hermanos", never *"tiene a los mismos padres" (localization B69). It is the
 * lexeme's, not the concept's: *ver* keeps the a on the very same object ("ve a los mismos padres").
 */
export function takesPersonalA(np: ResolvedNounPhrase, verbForms: Record<string, string> = {}): boolean {
  if (verbForms['object_no_a'] === '1') return false;
  // A counted head is no bare generic noun even when it writes no article: the numeral stands in the
  // indefinite's place (and an approximated one in the definite's), so "ve a dos amigos", "ve a unos
  // dos amigos" (A340).
  const determined = np.head.forms['definiteness'] !== 'bare' || np.head.forms['numeral'] !== undefined;
  return (np.head.forms['human'] === '1' || verbForms['object_a'] === '1') && determined;
}
