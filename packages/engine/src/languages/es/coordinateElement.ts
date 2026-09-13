import { joinConjuncts, type ResolvedNounElement, type ResolvedNounPhrase } from '../../types.js';

/**
 * Render every conjunct of a noun slot and coordinate them the Spanish way: commas between all
 * but the last pair, the conjunction on the last ("el gato, el perro y el zorro"). Both words
 * have a euphonic variant before their own sound — "y" becomes "e" before an i-/hi- word, "o"
 * becomes "u" before an o-/ho- one — which is why the link is a function of what follows it.
 *
 * `afterVerb` marks a slot after the verb (a direct object, a complement). There a last conjunct
 * determined "ningún" is linked with "ni" under either conjunction, the verb carrying the concord
 * "no": "no veo ningún niño ni ninguna niña". A subject group before the verb keeps "y" / "o".
 */
export function coordinateElement(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string, afterVerb = false): string {
  const last = el.conjuncts[el.conjuncts.length - 1];
  const ni = afterVerb && (el.conjunction === 'and' || el.conjunction === 'or') && last?.head.forms['definiteness'] === 'no';
  const link = (next: string) =>
    ni ? ' ni '
    : el.conjunction === 'or'
      ? (/^(o|ho)/i.test(next) ? ' u ' : ' o ')
      : (/^(i|hi(?!e))/i.test(next) ? ' e ' : ' y ');
  return joinConjuncts(el.conjuncts.map(render), ', ', link);
}
