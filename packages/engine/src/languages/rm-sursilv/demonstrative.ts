/**
 * The demonstratives, agreeing in gender and number and never elided (verify): proximal *quest,
 * questa, quests, questas*; distal *quel, quella, quels, quellas*.
 */
export function demonstrative(forms: Record<string, string>, plural: boolean, which: 'this' | 'that'): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  const stem = which === 'this' ? 'quest' : fem ? 'quell' : 'quel';
  return `${stem}${fem ? 'a' : ''}${plural ? 's' : ''}`;
}
