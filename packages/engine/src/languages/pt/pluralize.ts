/** Portuguese noun/adjective pluralisation: -m → -ns, -r/-z → -es, -l → -is, else +s. */
export function pluralize(word: string): string {
  if (/m$/i.test(word)) return `${word.slice(0, -1)}ns`;
  if (/[rz]$/i.test(word)) return `${word}es`;
  if (/l$/i.test(word)) return `${word.slice(0, -1)}is`;
  return `${word}s`;
}
