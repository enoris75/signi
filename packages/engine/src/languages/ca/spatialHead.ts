import type { PathSpecifier } from '@signi/shared';
import { BETWEEN_PREP } from './ca.consts.js';
import { aDet } from './aDet.js';
import { deDet } from './deDet.js';
import { prepDet } from './prepDet.js';

/**
 * The plain locative preposition (P03 §2.3): *a* before the definite article and a place name ("a la
 * casa", "al jardí", "a Europa"), *en* before every other determiner and a bare common noun ("en una
 * casa", "en aquesta casa", "en cap casa", "en realitat").
 */
export function inHead(f: Record<string, string>, plural: boolean): string {
  const definiteness = f['definiteness'] ?? 'definite';
  return definiteness === 'definite' || f['proper'] === '1' ? aDet(f, plural) : prepDet('en', f, plural);
}

/**
 * A spatial relation → preposition, honoring the head's determiner. Shared by route and locative:
 * "passa sota el llit" / "és sota el llit". *sota, sobre, contra, entre* govern the phrase directly;
 * *darrere de, davant de, al voltant de, per sobre de* end in *de*, which contracts with the article
 * ("darrere del gat"); the route's "through" is *per* ("pel parc").
 */
export function spatialHead(spec: PathSpecifier, plural: boolean, f: Record<string, string>): string {
  switch (spec) {
    case 'in':          return inHead(f, plural);
    case 'under':       return prepDet('sota', f, plural);
    case 'over':        return `per sobre ${deDet(f, plural)}`;
    case 'around':      return `al voltant ${deDet(f, plural)}`;
    case 'behind':      return `darrere ${deDet(f, plural)}`;
    case 'in_front_of': return `davant ${deDet(f, plural)}`;
    // P09-E1: `on` is *sobre*, apart from `in`; `between` and `among` share *entre*, lifted off a
    // group's conjuncts (GROUP_SCOPED_SPECIFIERS); the contact *contra*.
    case 'on':          return prepDet('sobre', f, plural);
    case 'between':     return prepDet(BETWEEN_PREP, f, plural);
    case 'among':       return prepDet(BETWEEN_PREP, f, plural);
    case 'against':     return prepDet('contra', f, plural);
    // A02: the distance pair, both ending in *de*: "a prop de la casa", "lluny del mercat".
    case 'near':        return `a prop ${deDet(f, plural)}`;
    case 'far':         return `lluny ${deDet(f, plural)}`;
    case 'through':
    default:            return prepDet('per', f, plural);
  }
}
