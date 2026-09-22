import type { ResolvedNounElement } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { elementPhrase } from './elementPhrase.js';
import { objectPrepCase } from './objectPrepCase.js';

/**
 * The accusative object, split by where it stands in the Mittelfeld. An unstressed personal pronoun
 * leads it, ahead of the progressive's "gerade", "nicht" and any adverb: "sieht ihn nicht immer",
 * "sieht ihn gerade". A full noun phrase keeps its place after the adverb ("sieht immer den Hund");
 * a pronoun there would be stressed and contrastive ("sieht immer IHN").
 *
 * `proObject` is the pro-form an elided subject complement leaves (A121's "es"), which is a pronoun
 * too: "der Hund ist es immer". A coordination is not an unstressed pronoun, so it stays with the nouns.
 *
 * `prep` is the preposition a verb takes its object with (A139): the object is then a prepositional
 * phrase in the case the preposition governs — the accusative ("klickt auf die Taste", "auf ihn"),
 * or the dative after a dative-only one ("hängt von der Bedingung ab", see `objectPrepCase`) — which
 * stands where a predicate complement does, after "nicht" ("klickt nicht auf die Taste"). A neuter
 * pronoun is the da-compound ("klickt darauf", "hängt davon ab").
 */
export function splitObject(
  directObject: ResolvedNounElement | undefined,
  proObject: string,
  prep = '',
): { pronoun: string; noun: string; prepositional: string } {
  if (!directObject) return { pronoun: proObject, noun: '', prepositional: '' };
  if (prep) {
    const pronoun = isPronounElement(directObject) ? firstConjunct(directObject).head.forms : undefined;
    const thing = pronoun?.['person'] === '3' && pronoun['gender'] === 'neut' && pronoun['number'] !== 'plural';
    const prepositional = thing ? `da${/^[aeiouäöü]/.test(prep) ? 'r' : ''}${prep}` : `${prep} ${elementPhrase(directObject, objectPrepCase(prep))}`;
    return { pronoun: '', noun: '', prepositional };
  }
  const text = elementPhrase(directObject, 'acc');
  return isPronounElement(directObject) ? { pronoun: text, noun: '', prepositional: '' } : { pronoun: '', noun: text, prepositional: '' };
}
