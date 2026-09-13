import type { PathSpecifier } from '@signi/shared';
import { prepDet } from './prepDet.js';
import { spatialCase } from './spatialCase.js';

// A spatial relation → preposition + case-declined determiner. "in" fuses with the dative "dem"
// (in+dem → im), which prepDet handles; none of the others fuse.
export function spatialHead(spec: PathSpecifier, f: Record<string, string>, plural: boolean): string {
  const _case = spatialCase(spec);
  switch (spec) {
    case 'in':          return prepDet('in', f, _case, plural);
    case 'under':       return prepDet('unter', f, _case, plural);
    case 'over':        return prepDet('über', f, _case, plural);
    case 'around':      return prepDet('um', f, _case, plural);
    case 'behind':      return prepDet('hinter', f, _case, plural);
    case 'in_front_of': return prepDet('vor', f, _case, plural);
    case 'through':
    default:            return prepDet('durch', f, _case, plural);
  }
}
