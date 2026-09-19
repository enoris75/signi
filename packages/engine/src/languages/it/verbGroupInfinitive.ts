import type { Aspect } from '@signi/shared';
import { agreeAdj } from './agreeAdj.js';
import { itEnclitic } from './itEnclitic.js';

/**
 * The main verb's whole group as an infinitive — what a modal governs. Neutral is the bare
 * infinito ("deve andare"); the marked aspects put their auxiliary in the infinitive ("deve
 * stare andando", "deve stare per andare"). The resultative infinitive apocopates "avere"
 * to "aver" before the participle, as Italian does ("deve aver visto"), while the
 * essere-selecting verbs keep the full auxiliary and agree their participle with the
 * subject ("deve essere andata"). An avere participle agrees with a third-person object clitic,
 * which climbs ahead of the modal (`objectForms`: "la deve aver vista").
 *
 * A pronominal verb's clitic (`reflexive`) agrees with the subject and attaches to the verb it belongs
 * to: the infinitive ("devo muovermi", "deve stare per muoversi"), the gerund ("deve stare
 * muovendosi") and "essere" in the perfect, whose participle has none ("deve essersi mossa").
 */
export function verbGroupInfinitive(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  aspect: Aspect,
  objectForms?: Record<string, string>,
  reflexive = '',
): string {
  const inf = verbForms['base'] ?? '';
  const own = (form: string) => itEnclitic(form, reflexive, 'infinitive');
  if (aspect === 'progressive') return `stare ${itEnclitic(verbForms['gerund'] ?? inf, reflexive, 'plain')}`;
  if (aspect === 'prospective') return `stare per ${own(inf)}`;
  if (aspect === 'resultative') {
    const base = verbForms['participle'] ?? inf;
    if (verbForms['aux'] !== 'be') {
      return objectForms
        ? `aver ${agreeAdj(base, objectForms['gender'] ?? 'masc', (objectForms['number'] ?? 'singular') === 'plural')}`
        : `aver ${base}`;
    }
    const part = agreeAdj(base, subjectForms['gender'] ?? 'masc', (subjectForms['number'] ?? 'singular') === 'plural');
    return `${own('essere')} ${part}`;
  }
  return own(inf);
}
