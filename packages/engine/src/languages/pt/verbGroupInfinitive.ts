import type { Aspect } from '@signi/shared';
import { reflexiveNonfinite } from './reflexiveNonfinite.js';

/**
 * The main verb's whole group as an infinitive — what a modal governs. Neutral is the bare
 * infinitivo ("deve ir"); the marked aspects put their auxiliary in the infinitive ("deve
 * estar indo", "deve ter visto").
 *
 * A reflexive verb's clitic agrees with the subject and stays attached to the verb it belongs to:
 * the infinitive or gerund ("devo mover-me", "devo estar movendo-me"), and "ter" in the perfect,
 * whose particípio has none ("deve ter-se movido") — A151.
 */
export function verbGroupInfinitive(verbForms: Record<string, string>, subjectForms: Record<string, string>, aspect: Aspect): string {
  const inf = verbForms['base'] ?? '';
  const own = (form: string) => reflexiveNonfinite(form, verbForms, subjectForms);
  if (aspect === 'progressive') return `estar ${own(verbForms['gerund'] ?? inf)}`;
  if (aspect === 'prospective') return `estar prestes a ${own(inf)}`;
  if (aspect === 'resultative') return `${own('ter')} ${verbForms['participle'] ?? inf}`;
  return own(inf);
}
