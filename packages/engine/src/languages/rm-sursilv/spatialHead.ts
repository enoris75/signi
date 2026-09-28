import type { PathSpecifier } from '@signi/shared';
import { BETWEEN_PREP } from './sursilv.consts.js';
import { prepDet } from './prepDet.js';

/**
 * A spatial relation → preposition, honoring the head's determiner (P04 §2.3, every word *(verify)*).
 * One map serves the locative and the route, as in the RG engine this was forked from: *en* (in),
 * *sut* (under), *sur* (over), *entuorn* (around), *davos* (behind), *davon* (in front of), *sin* (on),
 * *denter* (between, among), *encunter* (against), *tras* (through). Only *en* contracts with the
 * masculine article ("el tgaun", `prepArt`); the rest stand apart — "sin la meisa", "sut ils pumers".
 */
export function spatialHead(spec: PathSpecifier, f: Record<string, string>, plural: boolean, lead: string): string {
  const prep = (p: string): string => prepDet(p, f, plural, lead);
  switch (spec) {
    case 'in':          return prep('en');
    case 'under':       return prep('sut');
    case 'over':        return prep('sur');
    case 'around':      return prep('entuorn');
    case 'behind':      return prep('davos');
    case 'in_front_of': return prep('davon');
    case 'on':          return prep('sin');
    case 'between':     return prep(BETWEEN_PREP);
    // P09-E32: `among` is `between`'s word here, as in Italian.
    case 'among':       return prep(BETWEEN_PREP);
    case 'against':     return prep('encunter');
    // A02: the distance pair, adverb + *da*, which contracts ("datier dil tgaun", "lunsch da la
    // casa") *(verify)*.
    case 'near':        return `datier ${prep('da')}`;
    case 'far':         return `lunsch ${prep('da')}`;
    case 'through':
    default:            return prep('tras');
  }
}
