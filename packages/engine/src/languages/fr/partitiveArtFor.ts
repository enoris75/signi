import { artFor } from './artFor.js';
import { defArticle } from './defArticle.js';
import { dePrep } from './dePrep.js';

/**
 * The determiner of an argument French cannot leave bare. English drops the article on an indefinite
 * object or instrument ("eats mice", "drinks water", "names objects with words"). French has to write
 * the indefinite or partitive article instead: "des souris", "de l'eau", "avec des mots". A bare plural
 * takes "des" ("de" before a prenominal adjective, as with the indefinite). A bare singular splits on
 * countability (A207): a mass noun takes the partitive "du / de la / de l'" ("de la nourriture"), and a
 * count noun the definite, its one generic reading ("changer la taille", "écrire l'objet"). Any other
 * determiner is `artFor`'s, and so is a proper noun's.
 *
 * `possessedHeadForms` sets a possessed head's determiner to bare so that the possessive can take its
 * place. That bare is no zero article, so a caller with a pronominal possessor must not come here.
 */
export function partitiveArtFor(forms: Record<string, string>, plural: boolean, lead: string): string {
  // A question's stand-in takes none: "avec quoi", "avec qui" (P09-E15, see `questionStandIn`).
  if (forms['question'] === '1') return '';
  if (forms['proper'] === '1' || forms['definiteness'] !== 'bare') return artFor(forms, plural, lead);
  const mass = forms['uncountable'] === '1';
  if (plural && !mass) return artFor({ ...forms, definiteness: 'indefinite' }, true, lead);
  return mass || plural ? dePrep(forms, false, lead) : defArticle(forms, false, lead);
}
