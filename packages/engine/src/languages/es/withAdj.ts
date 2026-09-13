import type { EsAdjectives } from './es.types.js';

/** A noun with its adjectives set around it: the prenominal ones, the noun, then the rest. */
export function withAdj(word: string, adj?: EsAdjectives): string {
  const pre = adj?.pre ? `${adj.pre} ` : '';
  const post = adj?.post ? ` ${adj.post}` : '';
  return `${pre}${word}${post}`;
}
