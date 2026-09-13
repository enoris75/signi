import type { Aspect } from '@signi/shared';

/**
 * The main verb's whole group as an infinitive — what a modal governs. Neutral is the bare
 * infinitivo ("debe ir"); the marked aspects put their auxiliary in the infinitive ("debe
 * estar yendo", "debe haber visto").
 */
export function verbGroupInfinitive(verbForms: Record<string, string>, aspect: Aspect): string {
  const inf = verbForms['base'] ?? '';
  if (aspect === 'progressive') return `estar ${verbForms['gerund'] ?? inf}`;
  if (aspect === 'prospective') return `estar a punto de ${inf}`;
  if (aspect === 'resultative') return `haber ${verbForms['participle'] ?? inf}`;
  return inf;
}
