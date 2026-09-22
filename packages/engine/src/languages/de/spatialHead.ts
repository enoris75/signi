import type { PathSpecifier } from '@signi/shared';
import { prepDet } from './prepDet.js';
import { spatialCase } from './spatialCase.js';

// A spatial relation → preposition + case-declined determiner. "in" fuses with the dative "dem"
// (in+dem → im), which prepDet handles; none of the others fuse. The case depends on which
// complement the relation serves (see `spatialCase`): a route over crosses, "über den Markt".
// The plain relation is the noun's own: a place one is inside takes "in" ("im Haus"), and one that
// names another says so with `place_prep` — a place one is AT, "an einem Ort", "am Ende" (A218).
export function spatialHead(spec: PathSpecifier, f: Record<string, string>, plural: boolean, type: 'route' | 'locative' | 'direction'): string {
  const _case = spatialCase(spec, type);
  switch (spec) {
    case 'in':          return prepDet(f['place_prep'] ?? 'in', f, _case, plural);
    case 'under':       return prepDet('unter', f, _case, plural);
    case 'over':        return prepDet('über', f, _case, plural);
    case 'around':      return prepDet('um', f, _case, plural);
    case 'behind':      return prepDet('hinter', f, _case, plural);
    case 'in_front_of': return prepDet('vor', f, _case, plural);
    case 'through':
    default:            return prepDet('durch', f, _case, plural);
  }
}
