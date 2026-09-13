import type { ResolvedNounPhrase } from '../../types.js';
import { relativeText } from './relativeText.js';

/** Append a noun phrase's relative clause (if any) to its already-rendered surface. */
export function withRelative(text: string, np: ResolvedNounPhrase): string {
  const rel = relativeText(np);
  return rel ? `${text} ${rel}` : text;
}
