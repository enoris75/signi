/**
 * Join the rendered conjuncts of a coordinated slot the way a language coordinates: every
 * junction but the last takes `separator` (a comma in the European languages, と in Japanese),
 * and the last takes whatever `link` returns for the conjunct that follows it — a function, not a
 * word, because the conjunction is not always the same word: Spanish says "y" but "e" before an
 * i- sound, Italian "e" but "ed" before an e-.
 */
export function joinConjuncts(
  parts: string[],
  separator: string,
  link: (next: string) => string,
): string {
  const words = parts.filter(Boolean);
  if (words.length <= 1) return words[0] ?? '';
  const last = words[words.length - 1];
  return words.slice(0, -1).join(separator) + link(last) + last;
}
