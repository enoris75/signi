import { elidesBeforeVerb } from './elidesBeforeVerb.js';

/**
 * Join a clause's subject to its predicate. The subject clitic "je" elides before a vowel-initial
 * predicate ("j'ai mangé", "j'aime"), before a verb on an h muet, which its lexeme (`verbForms`) marks
 * `elides` ("j'habite", A227), and before the clitic "y" ("j'y suis"); any other subject, a tonic
 * "moi" included, takes a space.
 * Either side may be empty (an imperative has no subject).
 */
export function joinSubject(subject: string, predicate: string, verbForms: Record<string, string>): string {
  if (subject === 'je' && (elidesBeforeVerb(verbForms, predicate) || /^y /.test(predicate))) return `j'${predicate}`;
  return [subject, predicate].filter(Boolean).join(' ');
}
