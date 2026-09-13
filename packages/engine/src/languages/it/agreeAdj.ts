/**
 * Inflect an Italian adjective (given in masculine-singular "base" form) to agree
 * with the head noun's gender and number.
 * - "-o" class: freddo → fredda / freddi / fredde (hard c/g kept: stanco → stanchi/stanche)
 * - "-e" class: grande → grande / grandi (gender-invariant, plural -i)
 */
export function agreeAdj(base: string, gender: string, plural: boolean): string {
  if (!base) return '';
  const fem = gender === 'fem';
  if (base.endsWith('o')) {
    const stem = base.slice(0, -1);
    if (!plural) return fem ? `${stem}a` : base;
    const hardStem =
      base.endsWith('co') ? `${base.slice(0, -2)}ch` :
      base.endsWith('go') ? `${base.slice(0, -2)}gh` :
      stem;
    if (fem) return `${hardStem}e`;
    return hardStem.endsWith('i') ? hardStem : `${hardStem}i`;
  }
  if (base.endsWith('e')) {
    return plural ? `${base.slice(0, -1)}i` : base;
  }
  return base;
}
