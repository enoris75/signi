import { objectPronounForm } from '../../functions/objectPronounForm.js';
import type { Case } from './de.types.js';

/**
 * The surface a tonic pronoun takes in the case its preposition governs (A203). German is the one
 * language where the tonic form is not one form: each preposition rules a case, and the pronoun
 * declines for it —
 *
 * - **dative** ("in ihm", "von ihm", "zu ihr", "mit uns"), which the seeded `disjunctive` already
 *   is: it was written as the dative for A197's "mit", and the two-way prepositions take the dative
 *   for the static relation the locative is;
 * - **accusative** ("durch ihn", "um ihn", motion-*in*to "in ihn"), which is the `object` form the
 *   direct object takes — the same picker, so a feminine plural or a neuter agrees alike;
 * - **nominative** after the similative "wie" ("wie er"), which is the citation form `base`, the
 *   surface `resolveNounPhrase` has already put the person, number and gender into.
 *
 * The genitive never arrives: "wegen" is the cause's, and a pronoun cause took `causePhrase`.
 */
export function tonicPronounDe(forms: Record<string, string>, _case: Case): string {
  if (_case === 'acc') return objectPronounForm(forms);
  if (_case === 'nom') return forms['base'] ?? '';
  return forms['disjunctive'] ?? forms['base'] ?? '';
}
