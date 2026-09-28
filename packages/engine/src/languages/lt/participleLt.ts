import { aspectForm } from './aspectForm.js';
import type { VerbAgr } from './lt.types.js';

/**
 * A stored participle agreeing with the subject it is said of (P18 §2.2, style-lt.md): the **active
 * past** of the resultative (`past_active`: *katė yra suvalgiusi*, *katinas yra suvalgęs*, *katės yra
 * suvalgiusios*) or the **passive past** (`passive`, A01: *pelė buvo suvalgyta*), in the aspect the
 * clause picked, masculine, `_fem`, `_plural`, `_fem_plural` by the subject's gender and number. A
 * genderless subject takes the passive's `passive_neut` (*buvo nuspręsta*) and the active's masculine.
 * A verb with no such participle says its infinitive.
 */
export function participleLt(forms: Record<string, string>, kind: 'past_active' | 'passive', perfective: boolean, agr: VerbAgr): string {
  const suffix = agr.gender === 'neut' && !agr.plural ? (kind === 'passive' ? '_neut' : '')
    : `${agr.gender === 'fem' ? '_fem' : ''}${agr.plural ? '_plural' : ''}`;
  return aspectForm(forms, perfective, `${kind}${suffix}`) ?? aspectForm(forms, perfective, kind) ?? forms['base'] ?? '';
}
