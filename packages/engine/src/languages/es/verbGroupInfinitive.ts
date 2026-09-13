import type { Aspect } from '@signi/shared';
import { reflexiveNonfinite } from './reflexiveNonfinite.js';

/**
 * The main verb's whole group as an infinitive — what a modal governs. Neutral is the bare
 * infinitivo ("debe ir"); the marked aspects put their auxiliary in the infinitive ("debe
 * estar yendo", "debe haber visto").
 *
 * A reflexive verb's clitic agrees with the subject and stays attached to the verb it belongs to:
 * the infinitive or gerund ("debo volverme", "debo estar volviéndome"), and "haber" in the perfect,
 * whose participle has none ("debe haberse vuelto").
 */
export function verbGroupInfinitive(verbForms: Record<string, string>, subjectForms: Record<string, string>, aspect: Aspect): string {
  const inf = verbForms['base'] ?? '';
  const own = (form: string) => reflexiveNonfinite(form, verbForms, subjectForms);
  if (aspect === 'progressive') return `estar ${own(verbForms['gerund'] ?? inf)}`;
  if (aspect === 'prospective') return `estar a punto de ${own(inf)}`;
  if (aspect === 'resultative') return `${own('haber')} ${verbForms['participle'] ?? inf}`;
  return own(inf);
}
