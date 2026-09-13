import type { Aspect, Tense } from '@signi/shared';
import type { Mood } from '../../types.js';
import { ESTAR_AUX, ESTAR_ES, HABER_AUX, HABER_ES } from './es.consts.js';
import { auxFinite } from './auxFinite.js';
import { reflexiveClitic } from './reflexiveClitic.js';

/**
 * The verb group for a non-neutral aspect: progressive = estar + gerundio ("está yendo"),
 * prospective = estar + "a punto de" + infinitivo ("está a punto de ir"), resultative = haber
 * + participio ("ha visto", "había ido"). Negation ("no") is prepended by the caller, as for
 * the neutral verb.
 */
export function aspectVerb(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
  mood?: Mood,
): string {
  const inf = verbForms['base'] ?? '';
  const estar = auxFinite(ESTAR_AUX, ESTAR_ES, subjectForms, tense, mood);
  if (aspect === 'progressive') return `${estar} ${verbForms['gerund'] ?? inf}`;
  if (aspect === 'prospective') return `${estar} a punto de ${inf}`;
  // resultative: the reflexive clitic (if any) leads the auxiliary — "se ha vuelto".
  const perfect = `${auxFinite(HABER_AUX, HABER_ES, subjectForms, tense, mood)} ${verbForms['participle'] ?? inf}`;
  const clitic = reflexiveClitic(verbForms, subjectForms);
  return clitic ? `${clitic} ${perfect}` : perfect;
}
