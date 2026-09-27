/**
 * The demonstratives of Central Catalan's two-way system, agreeing in gender and number: proximal
 * *aquest, aquesta, aquests, aquestes* and distal *aquell, aquella, aquells, aquelles*.
 */
export function demonstrative(distal: boolean, forms: Record<string, string>, plural = false): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  const stem = distal ? 'aquell' : 'aquest';
  if (plural) return `${stem}${fem ? 'es' : 's'}`;
  return fem ? `${stem}a` : stem;
}
