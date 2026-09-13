import type { Aspect } from '@signi/shared';

/**
 * The main verb's whole group as an infinitive — what a modal governs. Neutral is the bare
 * infinitivo ("deve ir"); the marked aspects put their auxiliary in the infinitive ("deve
 * estar indo", "deve ter visto").
 */
export function verbGroupInfinitive(verbForms: Record<string, string>, aspect: Aspect): string {
  const inf = verbForms['base'] ?? '';
  if (aspect === 'progressive') return `estar ${verbForms['gerund'] ?? inf}`;
  if (aspect === 'prospective') return `estar prestes a ${inf}`;
  if (aspect === 'resultative') return `ter ${verbForms['participle'] ?? inf}`;
  return inf;
}
