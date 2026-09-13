import type { Aspect, Tense } from '@signi/shared';
import type { Mood } from '../../types.js';
import { ESTAR_AUX, ESTAR_PT, TER_AUX, TER_PT } from './pt.consts.js';
import { auxFinite } from './auxFinite.js';
import { conjugate } from './conjugate.js';

/**
 * The verb group for a non-neutral aspect: progressive = estar + gerúndio ("está indo"),
 * prospective = estar + "prestes a" + infinitivo ("está prestes a ir"), resultative = ter +
 * particípio in the past/future ("tinha ido", "terá visto") but the pretérito perfeito in the
 * present ("viu", not the iterative "tem visto" — see below). Negation ("não") is prepended by
 * the caller, as for the neutral verb.
 */
export function aspectVerb(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
  mood?: Mood,
): string {
  const inf = verbForms['base'] ?? '';
  if (aspect === 'progressive') return `${auxFinite(ESTAR_AUX, ESTAR_PT, subjectForms, tense, mood)} ${verbForms['gerund'] ?? inf}`;
  if (aspect === 'prospective') return `${auxFinite(ESTAR_AUX, ESTAR_PT, subjectForms, tense, mood)} prestes a ${inf}`;
  // Resultative. Portuguese has no present-perfect equivalent of Spanish "ha comido": "tem
  // comido" is iterative ("has been eating, repeatedly"), not the perfect of a bounded event, so
  // the *indicative* present resultative maps onto the pretérito perfeito (the simple past
  // "comeu"). But under a hypothetical a mood is set, and the conditional perfect "teria corrido"
  // / pluperfect subjunctive "tivesse corrido" is a genuine perfect, not iterative — so the A9
  // collapse is bypassed and ter + particípio takes the mood. The past (pluperfect "tinha ido")
  // and future (future perfect "terá visto") indicatives keep ter + particípio as before.
  if (mood === undefined && tense === 'present') return conjugate(verbForms, subjectForms, 'past');
  return `${auxFinite(TER_AUX, TER_PT, subjectForms, tense, mood)} ${verbForms['participle'] ?? inf}`;
}
