import type { EsAdjectives } from './es.types.js';
import { nounPhrase } from './nounPhrase.js';

export function subjectPhrase(forms: Record<string, string>, adj?: EsAdjectives, possessive?: string): string {
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, adj, possessive); // noun — definite article, or a pronominal possessive
}
