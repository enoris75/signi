import type { Aspect, Tense } from '@signi/shared';
import type { Mood } from '../../types.js';
import { AVERE_AUX, AVERE_IT, ESSERE_AUX, ESSERE_IT, STARE_AUX, STARE_IT } from './it.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { auxFinite } from './auxFinite.js';

/**
 * The verb group for a non-neutral aspect: progressive = stare + gerundio ("sto andando"),
 * prospective = stare + "per" + infinito ("sto per andare"), resultative = essere/avere +
 * participio passato. Which auxiliary is a lexical property of the verb (the seed marks the
 * essere-selecting ones with forms.aux = "be"); only an essere participle agrees with the
 * subject — "la ragazza è andata" but "la ragazza ha visto". An avere participle agrees instead with
 * a third-person object clitic ahead of it, passed as `objectForms`: "l'ha vista", "li ha visti".
 * Negation ("non") is prepended by the caller, as for the neutral verb.
 */
export function aspectVerb(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
  mood?: Mood,
  objectForms?: Record<string, string>,
): string {
  const inf = verbForms['base'] ?? '';
  if (aspect === 'resultative') {
    const essere = verbForms['aux'] === 'be';
    const aux = auxFinite(essere ? ESSERE_AUX : AVERE_AUX, essere ? ESSERE_IT : AVERE_IT, subjectForms, tense, mood);
    const base = verbForms['participle'] ?? inf;
    const agreeWith = essere ? subjectForms : objectForms;
    const part = agreeWith
      ? agreeAdj(base, agreeWith['gender'] ?? 'masc', (agreeWith['number'] ?? 'singular') === 'plural')
      : base;
    return `${aux} ${part}`.trim();
  }
  const aux = auxFinite(STARE_AUX, STARE_IT, subjectForms, tense, mood);
  if (aspect === 'prospective') return `${aux} per ${inf}`.trim();
  return `${aux} ${verbForms['gerund'] ?? inf}`.trim(); // progressive
}
