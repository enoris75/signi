import type { Aspect } from '@signi/shared';
import { VOWEL_START } from './fr.consts.js';
import { agreeParticipleFr } from './agreeParticipleFr.js';

/**
 * The main verb's whole group as an infinitive — what a modal governs. Neutral is the bare
 * infinitif ("doit aller"); the marked aspects put their auxiliary in the infinitive ("doit
 * être en train d'aller", "doit avoir vu", "doit être allée" — the être participle agreeing
 * with the subject, as ever).
 */
export function verbGroupInfinitiveFr(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  aspect: Aspect,
): string {
  const inf = verbForms['base'] ?? '';
  const deInf = VOWEL_START.test(inf) ? `d'${inf}` : `de ${inf}`;
  if (aspect === 'progressive') return `être en train ${deInf}`;
  if (aspect === 'prospective') return `être sur le point ${deInf}`;
  if (aspect === 'resultative') {
    const etre = verbForms['aux'] === 'be';
    const part = verbForms['participle'] ?? inf;
    return etre ? `être ${agreeParticipleFr(part, subjectForms)}` : `avoir ${part}`;
  }
  return inf;
}
