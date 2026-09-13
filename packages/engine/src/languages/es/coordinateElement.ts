import { joinConjuncts, type ResolvedNounElement, type ResolvedNounPhrase } from '../../types.js';

/**
 * Render every conjunct of a noun slot and coordinate them the Spanish way: commas between all
 * but the last pair, the conjunction on the last ("el gato, el perro y el zorro"). Both words
 * have a euphonic variant before their own sound — "y" becomes "e" before an i-/hi- word, "o"
 * becomes "u" before an o-/ho- one — which is why the link is a function of what follows it.
 */
export function coordinateElement(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const link = (next: string) =>
    el.conjunction === 'or'
      ? (/^(o|ho)/i.test(next) ? ' u ' : ' o ')
      : (/^(i|hi(?!e))/i.test(next) ? ' e ' : ' y ');
  return joinConjuncts(el.conjuncts.map(render), ', ', link);
}
