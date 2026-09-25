import type { ResolvedNounElement } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { FOCUS_WORDS } from './gsw.consts.js';
import { elementPhrase } from './elementPhrase.js';
import { objectPrepCase } from './objectPrepCase.js';
import { DA_COMPOUND } from './relativePronoun.js';

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
 *
 * `objCase` is the case a bare object declines in, the verb's own (see `objectCase`): the accusative
 * by default, the dative after *helfen* and its like ("hilft dem Hund", "hilft ihm"). It changes the
 * object's declension, not its place — a dative *object* is still the object, and stands where the
 * accusative one would, behind the bare-dative recipient a ditransitive hoists (C35).
 */
export function splitObject(
  directObject: ResolvedNounElement | undefined,
  proObject: string,
  prep = '',
  objCase: 'acc' | 'dat' = 'acc',
): { pronoun: string; noun: string; prepositional: string } {
  if (!directObject) return { pronoun: proObject, noun: '', prepositional: '' };
  if (prep) {
    const pronoun = isPronounElement(directObject) ? firstConjunct(directObject).head.forms : undefined;
    const thing = pronoun?.['person'] === '3' && pronoun['gender'] === 'neut' && pronoun['number'] !== 'plural';
    const prepositional = thing ? (DA_COMPOUND[prep] ?? `${prep} ${elementPhrase(directObject, objectPrepCase(prep))}`) : `${prep} ${elementPhrase(directObject, objectPrepCase(prep))}`;
    return { pronoun: '', noun: '', prepositional };
  }
  // A focus particle singles the object out, from outside everything the phrase writes: "frisst nur
  // das Essen", "frisst sogar das Essen" (see `withFocus`, C39).
  const text = withFocus(elementPhrase(directObject, objCase), slotFocus(directObject), FOCUS_WORDS);
  return isPronounElement(directObject) ? { pronoun: text, noun: '', prepositional: '' } : { pronoun: '', noun: text, prepositional: '' };
}
