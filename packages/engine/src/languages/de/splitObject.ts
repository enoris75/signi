import type { ResolvedNounElement } from '../../types.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { elementPhrase } from './elementPhrase.js';

/**
 * The accusative object, split by where it stands in the Mittelfeld. An unstressed personal pronoun
 * leads it, ahead of the progressive's "gerade", "nicht" and any adverb: "sieht ihn nicht immer",
 * "sieht ihn gerade". A full noun phrase keeps its place after the adverb ("sieht immer den Hund");
 * a pronoun there would be stressed and contrastive ("sieht immer IHN").
 *
 * `proObject` is the pro-form an elided subject complement leaves (A121's "es"), which is a pronoun
 * too: "der Hund ist es immer". A coordination is not an unstressed pronoun, so it stays with the nouns.
 */
export function splitObject(
  directObject: ResolvedNounElement | undefined,
  proObject: string,
): { pronoun: string; noun: string } {
  if (!directObject) return { pronoun: proObject, noun: '' };
  const text = elementPhrase(directObject, 'acc');
  return isPronounElement(directObject) ? { pronoun: text, noun: '' } : { pronoun: '', noun: text };
}
