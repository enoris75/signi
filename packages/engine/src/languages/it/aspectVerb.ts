import type { Aspect, Tense } from '@signi/shared';
import type { Mood } from '../../types.js';
import { AVERE_AUX, AVERE_IT, ESSERE_AUX, ESSERE_IT, STARE_AUX, STARE_IT } from './it.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { agreementForms } from './agreementForms.js';
import { auxFinite } from './auxFinite.js';
import { itEnclitic } from './itEnclitic.js';

/**
 * The verb group for a non-neutral aspect: progressive = stare + gerundio ("sto andando"),
 * prospective = stare + "per" + infinito ("sto per andare"), resultative = essere/avere +
 * participio passato. Which auxiliary is a lexical property of the verb (the seed marks the
 * essere-selecting ones with forms.aux = "be"), except that the impersonal "si" always takes essere
 * ("si è mangiato"). Only a lexical essere participle agrees with the subject — "la ragazza è andata"
 * but "la ragazza ha visto", and masculine plural under si ("si è andati", see `agreementForms`). An
 * avere participle agrees instead with an object ahead of it, passed as `objectForms`: a third-person
 * clitic ("l'ha vista", "li si è mangiati") or the passive si's patient ("si sono mangiati i topi").
 * Negation ("non") is prepended by the caller, as for the neutral verb.
 *
 * `reflexive` is a pronominal verb's clitic when it attaches to the non-finite verb: the gerund ("sta
 * muovendosi") or the infinitive ("sta per muoversi"). The resultative's clitic stands before essere
 * ("si è mosso"), so the caller places it there, with "non".
 */
export function aspectVerb(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
  mood?: Mood,
  objectForms?: Record<string, string>,
  reflexive = '',
): string {
  const inf = verbForms['base'] ?? '';
  if (aspect === 'resultative') {
    const lexicalEssere = verbForms['aux'] === 'be';
    const essere = lexicalEssere || subjectForms['generic'] === '1';
    const aux = auxFinite(essere ? ESSERE_AUX : AVERE_AUX, essere ? ESSERE_IT : AVERE_IT, subjectForms, tense, mood);
    const base = verbForms['participle'] ?? inf;
    const agreeWith = lexicalEssere ? agreementForms(subjectForms) : objectForms;
    const part = agreeWith
      ? agreeAdj(base, agreeWith['gender'] ?? 'masc', (agreeWith['number'] ?? 'singular') === 'plural')
      : base;
    return `${aux} ${part}`.trim();
  }
  const aux = auxFinite(STARE_AUX, STARE_IT, subjectForms, tense, mood);
  if (aspect === 'prospective') return `${aux} per ${itEnclitic(inf, reflexive, 'infinitive')}`.trim();
  return `${aux} ${itEnclitic(verbForms['gerund'] ?? inf, reflexive, 'plain')}`.trim(); // progressive
}
