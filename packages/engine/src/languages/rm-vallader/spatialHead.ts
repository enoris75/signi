import type { PathSpecifier } from '@signi/shared';
import { BETWEEN_PREP } from './vallader.consts.js';
import { prepDet } from './prepDet.js';

/**
 * A spatial relation → preposition, honoring the head's determiner (every word the author's draft,
 * *(verify)*). One map serves the locative and the route: *in* (in), *suot* (under), *sur* (over),
 * *intuorn* (around), *davo* (behind), *davant* (in front of), *sün* (on), *tanter* (between, among),
 * *cunter* (against), *tras* (through). Only *in* contracts with the article (`prepArt`: "i'l chan",
 * "illa chasa"); the others stand apart — "sün la maisa", "suot ils mailers".
 */
export function spatialHead(spec: PathSpecifier, f: Record<string, string>, plural: boolean, lead: string): string {
  const prep = (p: string): string => prepDet(p, f, plural, lead);
  switch (spec) {
    case 'in':          return prep('in');
    case 'under':       return prep('suot');
    case 'over':        return prep('sur');
    case 'around':      return prep('intuorn');
    case 'behind':      return prep('davo');
    case 'in_front_of': return prep('davant');
    case 'on':          return prep('sün');
    case 'between':     return prep(BETWEEN_PREP);
    // P09-E32: `among` is `between`'s word here, as in Italian.
    case 'among':       return prep(BETWEEN_PREP);
    case 'against':     return prep('cunter');
    case 'through':
    default:            return prep('tras');
  }
}
