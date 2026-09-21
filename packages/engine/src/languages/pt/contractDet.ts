import { demonstrative } from './demonstrative.js';
import { isBareName } from './isBareName.js';
import { prepDet } from './prepDet.js';

/**
 * Contracting preposition (a/de/em/por) + determiner. The definite article fuses via
 * `contract` (ao/à, do/da, no/na, pelo/pela); "em" and "de" fuse with a demonstrative just as
 * obligatorily (em+esta = nesta, de+esse = desse), which is the one determiner besides the
 * article that contracts. Everything else rides after the plain preposition uncontracted
 * ("a uma casa", "de muitas casas", "em nenhuma casa").
 */
export function contractDet(
  contract: (f: Record<string, string>, p: boolean) => string,
  prep: string,
  forms: Record<string, string>,
  plural = false,
): string {
  const definiteness = forms['definiteness'] ?? 'definite';
  // A proper noun keeps its definite article whatever was picked (see `artFor`), so it
  // contracts with it: "na África". A bare name has no article to contract with, and takes the
  // plain preposition whatever was picked: "de Portugal", "em Portugal".
  if (isBareName(forms)) return prep;
  if (definiteness === 'definite' || forms['proper'] === '1') return contract(forms, plural);
  if ((definiteness === 'this' || definiteness === 'that') && (prep === 'em' || prep === 'de')) {
    return `${prep === 'em' ? 'n' : 'd'}${demonstrative(definiteness === 'that', forms, plural)}`;
  }
  return prepDet(prep, forms, plural);
}
