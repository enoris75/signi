import type { PathSpecifier } from '@signi/shared';
import { BETWEEN_PREP } from './es.consts.js';
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
    // P09-E1. `on` is "sobre", not the "en" that `in` already spells — reusing it would render the
    // two relations alike — and it contracts with nothing ("sobre el tablero"); nor do "entre",
    // lifted off each conjunct and said once over a group (see `GROUP_SCOPED_SPECIFIERS`), and the
    // contact "contra" ("contra la pared").
    case 'on':          return prepDet('sobre', f, plural);
    case 'between':     return prepDet(BETWEEN_PREP, f, plural);
    // P09-E32: `among` is `between`'s word here, a deliberate merger (English and French alone tell
    // them apart); it is lifted off a group's conjuncts the same way.
    case 'among':       return prepDet(BETWEEN_PREP, f, plural);
    case 'against':     return prepDet('contra', f, plural);
    case 'through':
    default:            return prepDet('por', f, plural);
  }
}
