import { nounConjuncts, type NounElement, type PhrasePlan } from '@signi/shared';
import type { LexiconLookup } from '../translator.types.js';

/**
 * The languages whose 1st- and 2nd-person object clitic is also the dative one: *ti racconta*, *te
 * raconte*, *te cuenta*, *te conta* say "tells you" as they stand, where the addressee moved to the
 * terminus would come out as the heavier tonic "racconta a te".
 */
const SHARED_CLITIC_LANGUAGES: ReadonlySet<string> = new Set(['it', 'fr', 'es', 'pt']);

/**
 * A clause whose object is a **content clause** (P09-E4) and whose plan also names a direct object:
 * the clause is the thing told, so the object can only be the one it is told to. English writes that
 * addressee bare ahead of the clause ("tells the dog that the cat runs"), so the plan an English
 * speaker builds puts it in the direct object; the other six would read it as the thing told
 * ("*racconta il cane che…", "*erzählt den Hund, dass…"). Where the verb licenses a `terminus` (the
 * concept's `complements`) and the plan names none, the object is moved there before anything is
 * rendered, and renders as the addressee does: "racconta al cane che", "erzählt dem Hund, dass",
 * 犬に伝えます — and, for SAY, "says to the dog that" (A317).
 *
 * A passive keeps its object, the patient it promotes ("the dog is told that…"), and so does a Romance
 * 1st- or 2nd-person pronoun, whose clitic is already the addressee's (`SHARED_CLITIC_LANGUAGES`).
 * Unchanged otherwise.
 */
export function addresseeObject(plan: PhrasePlan, language: string, lookup: LexiconLookup): PhrasePlan {
  const { directObject, complements, contentObject, verbPhrase } = plan;
  if (!directObject || !contentObject || !verbPhrase || verbPhrase.voice === 'passive' || complements?.terminus) return plan;
  const licensed = (lookup(verbPhrase.verb, language)?.forms['complements'] ?? '').split(',').map((c) => c.trim());
  if (!licensed.includes('terminus')) return plan;
  if (SHARED_CLITIC_LANGUAGES.has(language) && isSpeechActPronoun(directObject, language, lookup)) return plan;
  const { directObject: _addressee, ...rest } = plan;
  return { ...rest, complements: { ...complements, terminus: { phrase: directObject } } };
}

/** Whether the element is one 1st- or 2nd-person personal pronoun. */
function isSpeechActPronoun(el: NounElement, language: string, lookup: LexiconLookup): boolean {
  const conjuncts = nounConjuncts(el);
  if (conjuncts.length !== 1) return false;
  const person = lookup(conjuncts[0].concept, language)?.forms['person'];
  return person === '1' || person === '2';
}
