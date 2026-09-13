import type { ResolvedModal } from '../../types.js';

/** Each verb's own adverb, in scope order (outermost modal first, main verb last), for the German
 *  Mittelfeld — "will nie immer gehen": the outermost modal's "nie" leads, the main verb's "immer"
 *  sits nearest the clause-final verb cluster. The caller appends the main verb's adverb after. */
export function modalAdverbs(modals: ResolvedModal[]): string {
  return modals.map((m) => m.modifier?.forms['base'] ?? '').filter(Boolean).join(' ');
}
