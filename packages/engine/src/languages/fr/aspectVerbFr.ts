import type { Aspect, Tense } from '@signi/shared';
import type { Mood } from '../../types.js';
import { AVOIR_AUX, AVOIR_FR, ETRE_AUX, ETRE_FR, VOWEL_START } from './fr.consts.js';
import { agreeParticipleFr } from './agreeParticipleFr.js';
import { auxFiniteFr } from './auxFiniteFr.js';
import { frCliticize } from './frCliticize.js';
import { reflexiveFinite } from './reflexiveFinite.js';
import { reflexiveInfinitive } from './reflexiveInfinitive.js';

/**
 * The verb group for a non-neutral aspect, split into the finite auxiliary (which negation
 * wraps) and the non-finite tail: progressive "en train de + inf", prospective "sur le
 * point de + inf" (both eliding "de" → "d'" before a vowel), resultative = the past
 * participle ("est allé", "a vu"). The resultative auxiliary is a lexical property of the
 * verb (the seed marks the être-selecting ones with forms.aux = "be"), and only an être
 * participle agrees with the subject — "elle est allée" but "elle a vu".
 */
export function aspectVerbFr(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
  mood?: Mood,
  // The gender/number of a PRECEDING direct object, when there is one — the antecedent of an
  // object-relative clause. French agrees an avoir participle with it (see the tail below).
  precedingObjectForms?: Record<string, string>,
  // An object clitic governed by the progressive / prospective infinitive, which it precedes ("en
  // train de me voir"); "de" elides against the clitic, not the verb ("de l'ajouter"). The resultative
  // ignores it: the compound past keeps its clitic on the auxiliary ("l'a vu"), placed by the caller.
  clitic = '',
): { finite: string; tail: string } {
  const inf = verbForms['base'] ?? '';
  // A reflexive infinitive agrees its clitic with the subject ("en train de m'effondrer").
  const group = frCliticize(clitic, reflexiveInfinitive(verbForms, subjectForms));
  const deInf = VOWEL_START.test(group) ? `d'${group}` : `de ${group}`;
  const etreFinite = auxFiniteFr(ETRE_AUX, ETRE_FR, subjectForms, tense, mood);
  if (aspect === 'progressive') return { finite: etreFinite, tail: `en train ${deInf}` };
  if (aspect === 'prospective') return { finite: etreFinite, tail: `sur le point ${deInf}` };
  const etre = verbForms['aux'] === 'be'; // resultative
  const part = verbForms['participle'] ?? inf;
  // A reflexive verb restores its clitic before the auxiliary ("s'est effondrée"); the participle
  // had dropped it. Only être-selecting verbs are reflexive here, but the helper is a no-op otherwise.
  const auxWord = etre ? etreFinite : auxFiniteFr(AVOIR_AUX, AVOIR_FR, subjectForms, tense, mood);
  return {
    finite: reflexiveFinite(verbForms, subjectForms, auxWord),
    // An être participle agrees with the subject ("elle est allée"). An avoir participle does NOT
    // agree with the subject ("elle a vu"), but DOES agree with a PRECEDING direct object — the
    // accord du COD antéposé: "la souris que le chat a mangée". Without one it keeps its base.
    tail: etre
      ? agreeParticipleFr(part, subjectForms)
      : precedingObjectForms ? agreeParticipleFr(part, precedingObjectForms) : part,
  };
}
