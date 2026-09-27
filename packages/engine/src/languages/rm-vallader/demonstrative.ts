/**
 * The demonstratives, agreeing in gender and number and never elided (the author's draft, verify):
 * proximal *quist, quista, quists, quistas*; distal *quel, quella, quels, quellas*.
 */
export function demonstrative(forms: Record<string, string>, plural: boolean, which: 'this' | 'that'): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  const stem = which === 'this' ? 'quist' : fem ? 'quell' : 'quel';
  return `${stem}${fem ? 'a' : ''}${plural ? 's' : ''}`;
}
