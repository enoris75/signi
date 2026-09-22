import { elidesBefore } from './elidesBefore.js';
import { partitiveArtFor } from './partitiveArtFor.js';

/**
 * The determiner of a direct object. It has no zero article (`partitiveArtFor`: "mange des souris",
 * "boit de l'eau", "un lieu qui a des murs"), and when the clause is negated its indefinite or
 * partitive article becomes "de", elided before a vowel sound: "ne mange pas de souris", "ne boit
 * jamais d'eau", "aucun chat ne mange de souris". The definite article, a demonstrative and the other
 * quantifiers are unchanged ("ne mange pas la souris", "ne mange pas quelques souris"), and so is a
 * proper noun's article.
 *
 * The negative "de" is the direct object's alone: an instrument or a prepositional object keeps its
 * article under a negation ("ne clique pas sur des boutons").
 *
 * A **counted** object is the one that really has none: the cardinal stands where the article would,
 * so there is no partitive and no negative "de" either — "mange deux souris", "ne mange pas deux
 * souris" (C31).
 */
export function objectArtFor(forms: Record<string, string>, plural: boolean, lead: string, negated: boolean): string {
  if (forms['numeral'] !== undefined) return '';
  const picked = forms['definiteness'] ?? 'definite';
  const partitive = picked === 'bare' || picked === 'indefinite'
    || (picked === 'some' && forms['uncountable'] === '1');
  if (negated && partitive && forms['proper'] !== '1') return elidesBefore(forms, lead) ? "d'" : 'de';
  return partitiveArtFor(forms, plural, lead);
}
