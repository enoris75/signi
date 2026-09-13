/** Spanish noun/adjective pluralisation: vowel → +s, -z → -ces, consonant → +es. */
export function pluralize(word: string): string {
  if (/[aeiouáéíóú]$/i.test(word)) return `${word}s`;
  if (/z$/i.test(word)) return `${word.slice(0, -1)}ces`;
  return `${word}es`;
}
