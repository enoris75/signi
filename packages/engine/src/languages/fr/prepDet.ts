import { artFor } from './artFor.js';

/**
 * Non-contracting preposition (dans / vers / sous / à travers …) + determiner. French only
 * fuses "à"/"de" with a definite article, so these carry whatever `artFor` yields: "dans une
 * maison", "dans la maison", bare "dans maison".
 */
export function prepDet(prep: string, forms: Record<string, string>, plural: boolean, lead: string): string {
  const det = artFor(forms, plural, lead);
  return det ? `${prep} ${det}` : prep;
}
