import { DEFAULT_LOCATIVE_SPECIFIER } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounPhrase } from '../types.js';
import { pathSpecifier } from './pathSpecifier.js';

/**
 * The fixed idiom a `locative` takes on a noun that names a hearth — "at home", "a casa", "zu
 * Hause" — or `undefined` when this conjunct is an ordinary preposition + noun phrase. The idiom is
 * a property of the noun, so each engine keys its table (`idioms`) by concept id; but it is a frozen,
 * article-less expression, so it holds only for plain containment on the unmodified singular noun.
 * A relation ("under the home"), a marked determiner ("in a home", "in this home"), a plural, or any
 * modification — adjective, attributive noun, possessor, relative clause — makes it a place again.
 */
export function locativeIdiom(
  c: ResolvedComplement,
  np: ResolvedNounPhrase,
  idioms: Readonly<Record<string, string>>,
): string | undefined {
  const f = np.head.forms;
  const definiteness = f['definiteness'] ?? 'definite';
  const plain =
    pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER) === 'in' &&
    (definiteness === 'definite' || definiteness === 'bare') &&
    (f['number'] ?? f['count']) !== 'plural' &&
    np.adjectives.length === 0 &&
    np.nounModifiers.length === 0 &&
    !np.possessor &&
    !np.relative;
  return plain ? idioms[np.head.conceptId] : undefined;
}
