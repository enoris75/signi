import type { Aspect } from '@signi/shared';
import { VOWEL_START } from './fr.consts.js';
import { agreeParticipleFr } from './agreeParticipleFr.js';
import { frCliticize } from './frCliticize.js';

/**
 * The main verb's whole group as an infinitive — what a modal governs. Neutral is the bare
 * infinitif ("doit aller"); the marked aspects put their auxiliary in the infinitive ("doit
 * être en train d'aller", "doit avoir vu", "doit être allée" — the être participle agreeing
 * with the subject, as ever).
 *
 * French has no clitic climbing, so an object `clitic` goes before the infinitive that governs it:
 * the verb ("me voir"), the progressive's ("être en train de me voir", "de" eliding against the
 * clitic) or the compound's auxiliary ("l'avoir vu"). That avoir participle agrees with the preceding
 * object, `precedingObjectForms` ("l'avoir vue").
 */
export function verbGroupInfinitiveFr(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  aspect: Aspect,
  clitic = '',
  precedingObjectForms?: Record<string, string>,
): string {
  const inf = verbForms['base'] ?? '';
  const group = frCliticize(clitic, inf);
  const deInf = VOWEL_START.test(group) ? `d'${group}` : `de ${group}`;
  if (aspect === 'progressive') return `être en train ${deInf}`;
  if (aspect === 'prospective') return `être sur le point ${deInf}`;
  if (aspect === 'resultative') {
    const etre = verbForms['aux'] === 'be';
    const part = verbForms['participle'] ?? inf;
    return etre
      ? frCliticize(clitic, `être ${agreeParticipleFr(part, subjectForms)}`)
      : frCliticize(clitic, `avoir ${precedingObjectForms ? agreeParticipleFr(part, precedingObjectForms) : part}`);
  }
  return group;
}
