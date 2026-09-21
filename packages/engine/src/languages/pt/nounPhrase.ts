import { KEPT_BESIDE_POSSESSIVE } from '../../possessive.js';
import type { PtAdjectives } from './pt.types.js';
import { artFor } from './artFor.js';
import { isPlural } from './isPlural.js';
import { withAdj } from './withAdj.js';

export function nounPhrase(forms: Record<string, string>, adj?: PtAdjectives, possessive?: string): string {
  const plural = isPlural(forms);
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const noun = withAdj(word, adj);
  const definiteness = forms['definiteness'] ?? 'definite';
  // A pronominal possessive ("o seu cão") replaces the picked determiner with the definite
  // article + possessive — unless the head carries a determiner of its own. Portuguese keeps both
  // by moving the possessive behind the noun, article and all left to the determiner: "este livro
  // seu", "nenhum livro seu" (A187). After "todos" the possessive stays in front with its article:
  // "todos os seus livros".
  if (possessive) {
    if (definiteness === 'all') {
      const fem = (forms['gender'] ?? 'masc') === 'fem';
      return `${plural ? (fem ? 'todas' : 'todos') : (fem ? 'toda' : 'todo')} ${possessive} ${noun}`;
    }
    if (KEPT_BESIDE_POSSESSIVE.has(definiteness)) {
      // `ptPossessiveWord` hands over the possessive with its leading definite article ("o seu");
      // postnominally that article belongs to the head's own determiner, so only the possessive goes.
      const own = possessive.split(' ').at(-1) ?? possessive;
      const det = artFor(forms, plural);
      return det ? `${det} ${noun} ${own}` : `${noun} ${own}`;
    }
    return `${possessive} ${noun}`;
  }
  const art = artFor(forms, plural); // definite / indefinite / bare
  return art ? `${art} ${noun}` : noun;
}
