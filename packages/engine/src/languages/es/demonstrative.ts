/**
 * The demonstratives, agreeing in gender and number: proximal "este/esta/estos/estas"
 * (this/these) and distal "ese/esa/esos/esas" (that/those).
 */
export function demonstrative(distal: boolean, forms: Record<string, string>, plural = false): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  const stem = distal ? 'es' : 'est';
  if (plural) return `${stem}${fem ? 'as' : 'os'}`;
  return `${stem}${fem ? 'a' : 'e'}`;
}
