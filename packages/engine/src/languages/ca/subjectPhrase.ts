import type { CaAdjectives } from './ca.types.js';
import { nounPhrase } from './nounPhrase.js';

/** A subject conjunct: a pronoun's own form ("nosaltres"), or a noun phrase with its determiner. */
export function subjectPhrase(forms: Record<string, string>, adj?: CaAdjectives, possessive?: string): string {
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, adj, possessive);
}
