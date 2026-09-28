import type { Government } from './lt.types.js';

/**
 * An adposition with its phrase (P18 §2.3): a preposition before it (*į namus*, *iš po stalo*), the one
 * postposition after it (*draugo dėka*), nothing for a bare case (*namuose*, *vaikui*). Lithuanian
 * writes no euphonic vowel, so unlike Polish's this only places the word.
 */
export function withPreposition(gov: Pick<Government, 'prep' | 'post'> | string, text: string): string {
  const { prep, post } = typeof gov === 'string' ? { prep: gov, post: false } : gov;
  if (!prep) return text;
  if (!text) return prep;
  return post ? `${text} ${prep}` : `${prep} ${text}`;
}
