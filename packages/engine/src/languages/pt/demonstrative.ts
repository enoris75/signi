/**
 * The demonstratives, agreeing in gender and number: proximal "este/esta/estes/estas"
 * (this/these) and medial "esse/essa/esses/essas" (that/those). Portuguese also has a distal
 * "aquele" (yonder, away from both speakers), but the two-way this/that contrast maps onto
 * este/esse, the pair that mirrors the speaker/hearer split "that" carries.
 */
export function demonstrative(distal: boolean, forms: Record<string, string>, plural = false): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  const stem = distal ? 'ess' : 'est';
  if (plural) return `${stem}${fem ? 'as' : 'es'}`;
  return `${stem}${fem ? 'a' : 'e'}`;
}
