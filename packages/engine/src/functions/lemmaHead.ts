import type { ConceptForms } from '../types.js';
import { lemmaTail } from './lemmaTail.js';
import { splitLemmaTail } from './splitLemmaTail.js';

/**
 * The verb of a multiword lemma alone, every stored form with the tail taken off ("avere bisogno" →
 * "avere", "abbiamo bisogno" → "abbiamo"), so a form derived by rule from a stored stem — the
 * imperfect, the conditional, the imperfect subjunctive — is derived on the verb and not on its noun
 * ("avere bisognova"). The caller puts the tail back. A one-word lemma comes back as it is.
 */
export function lemmaHead(verb: ConceptForms): ConceptForms {
  const tail = lemmaTail(verb);
  if (!tail) return verb;
  const forms = Object.fromEntries(
    Object.entries(verb.forms).map(([key, value]) => [key, splitLemmaTail(value, tail)[0]]),
  );
  return { ...verb, forms };
}
