import type { PathSpecifier } from '@signi/shared';

// durch/um govern accusative; the two-way (Wechsel-) prepositions — in/unter/über/hinter/vor —
// take the dative, the case German uses for a static relation. Route and locative mostly share it:
// the path under something and the place under it are the same phrase ("geht unter dem Bett" /
// "ist unter dem Bett"). A route over its landmark is the exception. It crosses the landmark, and
// the crossing is the accusative of motion ("springt über den Hund"); "über dem Hund" says only
// where the jump happens, which is the locative.
// A `direction` naming a relation is motion *into* it, and that is precisely what the accusative
// marks on a two-way preposition: "springt in die Luft" (into the air) against "ist in der Luft"
// (in it). So every relation takes the accusative there — the case is the whole of the difference.
export function spatialCase(spec: PathSpecifier, type: 'route' | 'locative' | 'direction'): 'acc' | 'dat' {
  if (type === 'direction') return 'acc';
  if (spec === 'through' || spec === 'around') return 'acc';
  return spec === 'over' && type === 'route' ? 'acc' : 'dat';
}
