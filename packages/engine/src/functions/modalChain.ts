import type { ConceptForms, ResolvedModal } from '../types.js';

/**
 * The words of a modal chain, outermost first, up to (but not including) the verb group it
 * governs: the outermost modal in the finite form `finite` builds (it alone carries the tense, the
 * agreement and the clause's sentential negation), then each inner modal's `nonfinite` form. Every
 * modal is followed by its `link` particle when it has one — English "want **to** go"; the Romance
 * and German modals govern a bare infinitive and set none. Shared by the five engines whose modals
 * are ordinary pre-infinitival verbs (en/it/fr/es/pt); German stacks its infinitives clause-finally
 * and Japanese suffixes them, so both build their own chain.
 *
 * An **inner** modal carries its own negation (`ResolvedModal.negative`), which takes `negator`
 * in front of it — "devo **non** poter andare", "I must **not** be able to go". It leads that
 * modal's own adverb, closest to the word it denies. The finite modal's negation is not this one:
 * it is the clause's, and `finite` has already built it.
 */
export function modalChain(
  modals: ResolvedModal[],
  finite: (m: ConceptForms) => string,
  adverb?: (m: ResolvedModal, i: number) => { pre?: string; post?: string },
  negator = '',
): string[] {
  const words: string[] = [];
  modals.forEach((m, i) => {
    const a = adverb?.(m, i) ?? {};
    if (i > 0 && m.negative && negator) words.push(negator);
    if (a.pre) words.push(a.pre);
    words.push(i === 0 ? finite(m.verb) : (m.verb.forms['nonfinite'] ?? m.verb.forms['base'] ?? ''));
    if (a.post) words.push(a.post);
    if (m.verb.forms['link']) words.push(m.verb.forms['link']);
  });
  return words.filter(Boolean);
}
