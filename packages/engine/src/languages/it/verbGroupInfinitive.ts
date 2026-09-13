import type { Aspect } from '@signi/shared';
import { agreeAdj } from './agreeAdj.js';

/**
 * The main verb's whole group as an infinitive — what a modal governs. Neutral is the bare
 * infinito ("deve andare"); the marked aspects put their auxiliary in the infinitive ("deve
 * stare andando", "deve stare per andare"). The resultative infinitive apocopates "avere"
 * to "aver" before the participle, as Italian does ("deve aver visto"), while the
 * essere-selecting verbs keep the full auxiliary and agree their participle with the
 * subject ("deve essere andata").
 */
export function verbGroupInfinitive(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  aspect: Aspect,
): string {
  const inf = verbForms['base'] ?? '';
  if (aspect === 'progressive') return `stare ${verbForms['gerund'] ?? inf}`;
  if (aspect === 'prospective') return `stare per ${inf}`;
  if (aspect === 'resultative') {
    const base = verbForms['participle'] ?? inf;
    if (verbForms['aux'] !== 'be') return `aver ${base}`;
    const part = agreeAdj(base, subjectForms['gender'] ?? 'masc', (subjectForms['number'] ?? 'singular') === 'plural');
    return `essere ${part}`;
  }
  return inf;
}
