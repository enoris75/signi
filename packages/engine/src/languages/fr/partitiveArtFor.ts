import { artFor } from './artFor.js';
import { dePrep } from './dePrep.js';

/**
 * The determiner of an argument French cannot leave bare. English drops the article on an indefinite
 * object or instrument ("eats mice", "drinks water", "names objects with words"). French has to write
 * the indefinite or partitive article instead: "des souris", "de l'eau", "avec des mots". A bare plural
 * takes "des" ("de" before a prenominal adjective, as with the indefinite), and a bare singular takes
 * the partitive "du / de la / de l'". Any other determiner is `artFor`'s, and so is a proper noun's.
 *
 * `possessedHeadForms` sets a possessed head's determiner to bare so that the possessive can take its
 * place. That bare is no zero article, so a caller with a pronominal possessor must not come here.
 */
export function partitiveArtFor(forms: Record<string, string>, plural: boolean, lead: string): string {
  if (forms['proper'] === '1' || forms['definiteness'] !== 'bare') return artFor(forms, plural, lead);
  return plural && forms['uncountable'] !== '1'
    ? artFor({ ...forms, definiteness: 'indefinite' }, true, lead)
    : dePrep(forms, false, lead);
}
