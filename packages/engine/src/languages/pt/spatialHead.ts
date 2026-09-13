import type { PathSpecifier } from '@signi/shared';
import { contractDet } from './contractDet.js';
import { dePrep } from './dePrep.js';
import { emPrep } from './emPrep.js';
import { porPrep } from './porPrep.js';

/**
 * A spatial relation → preposition, honoring the head's determiner. Shared by route and locative:
 * Portuguese uses the same locution for the path under something and the place under it ("vai
 * debaixo da cama" / "está debaixo da cama"), so one map serves both — only the default differs.
 *
 * Most are "de"-locutions (debaixo de, ao redor de, …) whose "de" fuses only with the definite
 * ("debaixo do carro" but "debaixo de uma casa"); "through" is "por", which fuses to pelo/pela
 * with the definite ("pela casa") and stays "por" + determiner otherwise ("por uma casa"). Plain
 * "em" fuses the same way (no/na).
 */
export function spatialHead(spec: PathSpecifier, f: Record<string, string>, plural: boolean): string {
  switch (spec) {
    case 'in':          return contractDet(emPrep, 'em', f, plural);
    case 'under':       return `debaixo ${contractDet(dePrep, 'de', f, plural)}`;
    case 'over':        return `por cima ${contractDet(dePrep, 'de', f, plural)}`;
    case 'around':      return `ao redor ${contractDet(dePrep, 'de', f, plural)}`;
    case 'behind':      return `atrás ${contractDet(dePrep, 'de', f, plural)}`;
    case 'in_front_of': return `em frente ${contractDet(dePrep, 'de', f, plural)}`;
    case 'through':
    default:            return contractDet(porPrep, 'por', f, plural);
  }
}
