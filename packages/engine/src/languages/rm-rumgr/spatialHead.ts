import type { PathSpecifier } from '@signi/shared';
import { BETWEEN_PREP } from './rumgr.consts.js';
import { prepDet } from './prepDet.js';

/**
 * A spatial relation → preposition, honoring the head's determiner (P04 §2.3, every word *(verify)*).
 * One map serves the locative and the route, as in the `it` engine this was forked from: *en* (in),
 * *sut* (under), *sur* (over), *enturn* (around), *davos* (behind), *davant* (in front of), *sin* (on),
 * *tranter* (between, among), *cunter* (against), *tras* (through). None contracts with the article —
 * "en il chaun", "sin la maisa", "sut ils mailers" — so every one goes through `prepDet` as a plain word.
 */
export function spatialHead(spec: PathSpecifier, f: Record<string, string>, plural: boolean, lead: string): string {
  const prep = (p: string): string => prepDet(p, f, plural, lead);
  switch (spec) {
    case 'in':          return prep('en');
    case 'under':       return prep('sut');
    case 'over':        return prep('sur');
    case 'around':      return prep('enturn');
    case 'behind':      return prep('davos');
    case 'in_front_of': return prep('davant');
    case 'on':          return prep('sin');
    case 'between':     return prep(BETWEEN_PREP);
    // P09-E32: `among` is `between`'s word here, as in Italian.
    case 'among':       return prep(BETWEEN_PREP);
    case 'against':     return prep('cunter');
    // A02: the distance pair, adverb + *da*, which contracts ("datiers dal chaun", "lunsch da la
    // chasa") *(verify)*.
    case 'near':        return `datiers ${prep('da')}`;
    case 'far':         return `lunsch ${prep('da')}`;
    case 'through':
    default:            return prep('tras');
  }
}
