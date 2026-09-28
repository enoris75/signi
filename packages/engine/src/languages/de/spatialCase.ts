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
// P09-E1's three are two-way prepositions too — auf, zwischen, an — and follow the rule unchanged:
// "auf dem Tisch" / "auf den Tisch", "an der Wand" / "an die Wand".
// A02's distance pair keeps its own case whatever the complement, since what it governs is no two-way
// preposition: `near` is the genitive after "in der Nähe" ("in der Nähe des Hauses"), or the dative
// after "von" where the genitive would not show (`genitive` false: "in der Nähe von Häusern"); `far`
// is the dative after "weit weg von".
export function spatialCase(spec: PathSpecifier, type: 'route' | 'locative' | 'direction', genitive = true): 'acc' | 'dat' | 'gen' {
  if (spec === 'near') return genitive ? 'gen' : 'dat';
  if (spec === 'far') return 'dat';
  if (type === 'direction') return 'acc';
  if (spec === 'through' || spec === 'around') return 'acc';
  return spec === 'over' && type === 'route' ? 'acc' : 'dat';
}
