import { objectPronounForm } from './objectPronounForm.js';

/**
 * The indirect-object (dative) clitic of a pronoun, by number/gender: Italian "gli"/"le"/"gli",
 * French "lui"/"leur". Only the 3rd person distinguishes it from the accusative, so the 1st and 2nd
 * fall back to `objectPronounForm` ("mi telefona", "me téléphone"), as does any language that seeds
 * no dative row. Used for the object of a verb that takes it with the dative preposition — Italian
 * "a", French "à" — where the tonic pronoun after the preposition is contrastive at best (A240).
 */
export function dativePronounForm(forms: Record<string, string>): string {
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  const gender = forms['gender'];
  if (plural && gender === 'fem' && forms['dative_plural_fem']) return forms['dative_plural_fem'];
  if (plural && forms['dative_plural']) return forms['dative_plural'];
  if (!plural && gender === 'fem' && forms['dative_fem']) return forms['dative_fem'];
  if (!plural && gender === 'neut' && forms['dative_neut']) return forms['dative_neut'];
  if (!plural && forms['dative']) return forms['dative'];
  return objectPronounForm(forms);
}
