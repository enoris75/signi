import type { PathSpecifier } from '@signi/shared';
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
    case 'through':
    default:            return prepDet('à travers', f, plural, lead);
  }
}
