import type { PathSpecifier } from '@signi/shared';
import { deDet } from './deDet.js';
import { prepDet } from './prepDet.js';

/**
 * A spatial relation → preposition, honoring the head's determiner. Shared by route and locative:
 * Spanish uses the same locution for the path under something and the place under it ("va debajo
 * de la cama" / "está debajo de la cama"), so one map serves both — only the default differs.
 *
 * Most are "de"-locutions (debajo de, alrededor de, …) whose "de" fuses only with "el" ("debajo
 * del árbol" but "debajo de una casa"), via `deDet`; "through" is the bare preposition "por", which
 * takes a non-fusing article ("por la casa" / "por una casa"), as does plain "en".
 */
export function spatialHead(spec: PathSpecifier, plural: boolean, f: Record<string, string>): string {
  switch (spec) {
    case 'in':          return prepDet('en', f, plural);
    case 'under':       return `debajo ${deDet(f, plural)}`;
    case 'over':        return `por encima ${deDet(f, plural)}`;
    case 'around':      return `alrededor ${deDet(f, plural)}`;
    case 'behind':      return `detrás ${deDet(f, plural)}`;
    case 'in_front_of': return `delante ${deDet(f, plural)}`;
    case 'through':
    default:            return prepDet('por', f, plural);
  }
}
