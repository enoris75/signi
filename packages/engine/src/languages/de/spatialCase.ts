import type { PathSpecifier } from '@signi/shared';

// durch/um govern accusative; the two-way (Wechsel-) prepositions — in/unter/über/hinter/vor —
// take the dative, the case German uses for a static relation. That is why route and locative can
// share one map: the two-way preps are already in the dative for a route, which is the case a
// locative needs anyway ("geht unter dem Bett" / "ist unter dem Bett" — same phrase).
export function spatialCase(spec: PathSpecifier): 'acc' | 'dat' {
  return spec === 'through' || spec === 'around' ? 'acc' : 'dat';
}
