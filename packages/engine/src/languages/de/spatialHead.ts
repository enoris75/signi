import type { PathSpecifier } from '@signi/shared';
import { BETWEEN_PREP } from './de.consts.js';
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
    // P09-E1: support "auf", apart from `over`'s "über"; contact "an", not the "gegen" of motion
    // into it, which the accusative of a direction already says ("an die Wand"). "an" fuses as it
    // does for a place one is at ("am Baum"). "zwischen" is lifted off each conjunct and said once
    // over a group, each conjunct keeping its own dative article (see `GROUP_SCOPED_SPECIFIERS`).
    case 'on':          return prepDet('auf', f, _case, plural);
    case 'between':     return prepDet(BETWEEN_PREP, f, _case, plural);
    // P09-E32: `among` is `between`'s word here (dative for a place, accusative for a goal), a deliberate merger (English and French alone tell
    // them apart); it is lifted off a group's conjuncts the same way.
    case 'among':       return prepDet(BETWEEN_PREP, f, _case, plural);
    case 'against':     return prepDet('an', f, _case, plural);
    case 'through':
    default:            return prepDet('durch', f, _case, plural);
  }
}
