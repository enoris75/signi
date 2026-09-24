import type { PathSpecifier } from '@signi/shared';
import { BETWEEN_PREP } from './it.consts.js';
import { artFor } from './artFor.js';
import { prepDet } from './prepDet.js';

/**
 * A spatial relation → preposition, honoring the head's determiner. Shared by route and locative:
 * Italian draws no distinction between the path under something and the place under it ("va sotto
 * il letto" / "è sotto il letto"), so one map serves both — only the default relation differs.
 *
 * The place adverbs (sotto/sopra/dietro/attraverso) take a plain, non-fusing article, so the
 * determiner rides straight off `artFor` ("sotto la casa" / "sotto una casa" / "sotto casa").
 * "intorno" and "davanti" govern "a", which fuses only with the definite ("intorno alla casa" but
 * "intorno a una casa"), so they route through `prepDet`. Plain "in" fuses outright ("nella casa").
 *
 * P09-E1: `on` is "su", a simple preposition that fuses as "in" does ("sul tavolo", "su un
 * tavolo"), and so is kept apart from `over`'s "sopra"; `against` is the plain "contro" ("contro il
 * muro"); `between` is "tra" with a plain article, built here per conjunct like any relation and
 * lifted off to be said once over a group by the complement (see `GROUP_SCOPED_SPECIFIERS`).
 */
export function spatialHead(spec: PathSpecifier, f: Record<string, string>, plural: boolean, lead: string): string {
  const adv = (a: string): string => { const det = artFor(f, plural, lead); return det ? `${a} ${det}` : a; };
  switch (spec) {
    case 'in':          return prepDet('in', f, plural, lead);
    case 'under':       return adv('sotto');
    case 'over':        return adv('sopra');
    case 'around':      return `intorno ${prepDet('a', f, plural, lead)}`;
    case 'behind':      return adv('dietro');
    case 'in_front_of': return `davanti ${prepDet('a', f, plural, lead)}`;
    case 'on':          return prepDet('su', f, plural, lead);
    case 'between':     return adv(BETWEEN_PREP);
    // P09-E32: `among` is `between`'s word here, a deliberate merger (English and French alone tell
    // them apart); it is lifted off a group's conjuncts the same way.
    case 'among':       return adv(BETWEEN_PREP);
    case 'against':     return adv('contro');
    case 'through':
    default:            return adv('attraverso');
  }
}
