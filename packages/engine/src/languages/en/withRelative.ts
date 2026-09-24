import type { ResolvedNounPhrase } from '../../types.js';
import { enExamples } from './enExamples.js';
import { relativeText } from './relativeText.js';

/**
 * Append a noun phrase's relative clause (if any) to its already-rendered surface, and after it the
 * members of the head's set it names ("the animals that run, including the cat", P09-E33).
 */
export function withRelative(text: string, np: ResolvedNounPhrase): string {
  const rel = relativeText(np);
  return `${rel ? `${text} ${rel}` : text}${enExamples(np)}`;
}
