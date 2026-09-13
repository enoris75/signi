/** Attach -er/-est with English's spelling rules (doubling, y → i, silent e). */
export function inflect(base: string, suffix: 'er' | 'est'): string {
  if (/e$/.test(base)) return base + suffix.slice(1);            // large → larger
  if (/[^aeiou]y$/.test(base)) return `${base.slice(0, -1)}i${suffix}`; // happy → happier
  // A stressed consonant-vowel-consonant ending doubles its final consonant: big → bigger.
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(base)) return base + base.slice(-1) + suffix;
  return base + suffix;
}
