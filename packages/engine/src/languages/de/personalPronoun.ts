import { DE_PERSONAL, DE_THIRD_SINGULAR } from './de.consts.js';

/**
 * The nominative personal pronoun that refers back to `forms` — a subject slot's agreement, or a
 * relative clause's head — with the person-number its verb agrees in: "ich"/"wir", "du"/"ihr",
 * "sie" for any third plural, and in the third singular the pronoun of the referent's grammatical
 * gender ("der Kater" → "er", "die Katze" → "sie", "das Kind" → "es"; neuter when none is known,
 * as the articles default). The generic person is "man" (3sg), which is its own pronoun.
 */
export function personalPronoun(forms: Record<string, string>): { pronoun: string; pn: string } {
  if (forms['generic'] === '1') return { pronoun: 'man', pn: '3sg' };
  const person = forms['person'] ?? '3';
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  const pn = `${person}${plural ? 'pl' : 'sg'}`;
  const pronoun = pn === '3sg' ? DE_THIRD_SINGULAR[forms['gender'] ?? 'neut'] : DE_PERSONAL[pn];
  return { pronoun: pronoun ?? 'es', pn };
}
