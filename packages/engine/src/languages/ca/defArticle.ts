/**
 * The definite article before the noun phrase's first word: *el, la, els, les*. Its elision to *l'*
 * ("l'home", "l'aigua") and its contraction with *a, de, per* ("al gat") are orthography between two
 * words, written by `caSurface` once the phrase is whole.
 */
export function defArticle(forms: Record<string, string>, plural = false): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  if (plural) return fem ? 'les' : 'els';
  return fem ? 'la' : 'el';
}
