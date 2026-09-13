import { VOWEL_START } from './fr.consts.js';

/**
 * Join a clause's subject to its predicate. The subject clitic "je" elides before a vowel-initial
 * predicate ("j'ai mangé", "j'aime"); any other subject, a tonic "moi" included, takes a space.
 * Either side may be empty (an imperative has no subject).
 */
export function joinSubject(subject: string, predicate: string): string {
  if (subject === 'je' && VOWEL_START.test(predicate)) return `j'${predicate}`;
  return [subject, predicate].filter(Boolean).join(' ');
}
