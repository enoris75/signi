/** Join a sequence of words, dropping the space after an elided word ("l'auter"). */
export function joinWords(words: string[]): string {
  return words
    .filter(Boolean)
    .reduce((acc, w) => (!acc ? w : acc.endsWith("'") ? `${acc}${w}` : `${acc} ${w}`), '');
}
