import type { PathSpecifier } from '@signi/shared';

// durch/um govern accusative; the two-way (Wechsel-) prepositions — in/unter/über/hinter/vor —
// take the dative, the case German uses for a static relation. Route and locative mostly share it:
// the path under something and the place under it are the same phrase ("geht unter dem Bett" /
// "ist unter dem Bett"). A route over its landmark is the exception. It crosses the landmark, and
// the crossing is the accusative of motion ("springt über den Hund"); "über dem Hund" says only
// where the jump happens, which is the locative.
export function spatialCase(spec: PathSpecifier, type: 'route' | 'locative'): 'acc' | 'dat' {
  if (spec === 'through' || spec === 'around') return 'acc';
  return spec === 'over' && type === 'route' ? 'acc' : 'dat';
}
