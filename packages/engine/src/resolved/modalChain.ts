import type { ConceptForms, ResolvedModal } from '../types.js';

/**
 * The words of a modal chain, outermost first, up to (but not including) the verb group it
 * governs: the outermost modal in the finite form `finite` builds (it alone carries tense,
 * agreement, and negation), then each inner modal's `nonfinite` form. Every modal is followed
 * by its `link` particle when it has one — English "want **to** go"; the Romance and German
 * modals govern a bare infinitive and set none. Shared by the five engines whose modals are
 * ordinary pre-infinitival verbs (en/it/fr/es/pt); German stacks its infinitives clause-finally
 * and Japanese suffixes them, so both build their own chain.
 */
export function modalChain(
  modals: ResolvedModal[],
  finite: (m: ConceptForms) => string,
  adverb?: (m: ResolvedModal, i: number) => { pre?: string; post?: string },
): string[] {
  const words: string[] = [];
  modals.forEach((m, i) => {
    const a = adverb?.(m, i) ?? {};
    if (a.pre) words.push(a.pre);
    words.push(i === 0 ? finite(m.verb) : (m.verb.forms['nonfinite'] ?? m.verb.forms['base'] ?? ''));
    if (a.post) words.push(a.post);
    if (m.verb.forms['link']) words.push(m.verb.forms['link']);
  });
  return words.filter(Boolean);
}
