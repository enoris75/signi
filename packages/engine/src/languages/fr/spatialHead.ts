import type { PathSpecifier } from '@signi/shared';
import { AMONG_PREP, BETWEEN_PREP } from './fr.consts.js';
import { deDet } from './deDet.js';
import { prepDet } from './prepDet.js';

/**
 * A spatial relation → preposition, honoring the head's determiner. Shared by route and locative:
 * French uses the same adposition for the path under something and the place under it ("va sous le
 * lit" / "est sous le lit"), so one map serves both — only the default relation differs. The one
 * split is `over`: a route over its landmark crosses it, "par-dessus le chien", while "au-dessus du
 * chien" is the place above it, which is the locative.
 *
 * The plain adverbs (sous / derrière / devant / à travers / par-dessus) take a non-fusing article straight off
 * `artFor` ("sous une maison" / "sous la maison"); "au-dessus" and "autour" govern "de", which
 * fuses only with the definite ("autour de la maison" but "autour d'une maison"), via `deDet`.
 */
export function spatialHead(
  spec: PathSpecifier,
  f: Record<string, string>,
  plural: boolean,
  lead: string,
  type: 'route' | 'locative',
): string {
  switch (spec) {
    case 'in':          return prepDet('dans', f, plural, lead);
    case 'under':       return prepDet('sous', f, plural, lead);
    case 'over':        return type === 'route' ? prepDet('par-dessus', f, plural, lead) : `au-dessus ${deDet(f, plural, lead)}`;
    case 'around':      return `autour ${deDet(f, plural, lead)}`;
    case 'behind':      return prepDet('derrière', f, plural, lead);
    case 'in_front_of': return prepDet('devant', f, plural, lead);
    // P09-E1. "sur" is support, apart from `over`'s "au-dessus de"; "contre" is contact; "entre" is
    // lifted off each conjunct and said once over a group (see `GROUP_SCOPED_SPECIFIERS`). None of
    // the three contracts: "sur la table", "entre la maison et l'arbre", "contre le mur".
    case 'on':          return prepDet('sur', f, plural, lead);
    case 'between':     return prepDet(BETWEEN_PREP, f, plural, lead);
    // P09-E32: `among` is "parmi", French's own word, not `between`'s "entre"; it contracts with
    // nothing ("parmi les maisons") and is lifted off a group's conjuncts as "entre" is.
    case 'among':       return prepDet(AMONG_PREP, f, plural, lead);
    case 'against':     return prepDet('contre', f, plural, lead);
    case 'through':
    default:            return prepDet('à travers', f, plural, lead);
  }
}
