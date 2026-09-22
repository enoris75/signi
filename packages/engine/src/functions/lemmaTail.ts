import type { ConceptForms } from '../types.js';

// A French pronominal verb's base leads with its clitic ("se déplacer", "s'effondrer"), and a German
// one with "sich": a clitic, not a verb, so what follows it is no tail.
const LEADING_CLITIC = /^(?:se |s'|sich )/;

/**
 * The words a multiword Romance lemma carries after its verb: the noun of a light-verb idiom, avere
 * **bisogno** and avoir **besoin** (NEED, localization B62). The lexeme stores it in every form —
 * the finite ones ("ha bisogno", "a besoin"), the participle ("avuto bisogno", "eu besoin") and the
 * gerund — so a verb group that is one piece renders the stored form as it is. What needs the tail
 * apart is whatever goes *between* the conjugated verb and its noun: the French negator and a
 * frequency adverb ("n'a pas besoin", "a toujours besoin"), and a mood form derived from a stored
 * stem, which must be derived on the verb alone ("aveva bisogno", "aurait besoin"; see
 * `lemmaHead`). "" for a one-word lemma, and for a pronominal one.
 */
export function lemmaTail(verb: ConceptForms): string {
  const base = verb.forms['base'] ?? '';
  if (LEADING_CLITIC.test(base)) return '';
  const space = base.indexOf(' ');
  return space < 0 ? '' : base.slice(space + 1);
}
