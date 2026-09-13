const ACCENTED: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
const PLAIN: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };

/**
 * Spanish noun/adjective pluralisation: vowel → +s, -z → -ces, consonant → +es. The extra syllable of
 * -es moves the stress one place from the end, so the written accent follows it:
 * - a stressed final vowel before -n/-s loses its accent ("marrón" → "marrones");
 * - an unaccented word in -n/-s of two syllables or more gains one on its second-to-last syllable,
 *   now the third-to-last ("joven" → "jóvenes"). In a diphthong the accent goes on the strong vowel.
 * A word whose stress shifts ("carácter" → "caracteres") needs a seeded plural.
 */
export function pluralize(word: string): string {
  if (/[aeiouáéíóú]$/i.test(word)) return `${word}s`;
  if (/z$/i.test(word)) return `${word.slice(0, -1)}ces`;
  const lastWord = word.slice(word.lastIndexOf(' ') + 1);
  const stem = word.slice(0, word.length - lastWord.length);
  const oxytone = /([áéíóú])([ns])$/i.exec(lastWord);
  if (oxytone) return `${stem}${lastWord.slice(0, oxytone.index)}${PLAIN[oxytone[1].toLowerCase()]}${oxytone[2]}es`;
  if (/[ns]$/i.test(lastWord) && !/[áéíóú]/i.test(lastWord)) {
    const nuclei = [...lastWord.matchAll(/[aeiou]+/gi)];
    if (nuclei.length >= 2) {
      const nucleus = nuclei[nuclei.length - 2];
      const text = nucleus[0];
      const strong = text.search(/[aeo]/i);
      const at = nucleus.index! + (strong >= 0 ? strong : text.length - 1);
      return `${stem}${lastWord.slice(0, at)}${ACCENTED[lastWord[at].toLowerCase()]}${lastWord.slice(at + 1)}es`;
    }
  }
  return `${word}es`;
}
