const ACCENT: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
const PLAIN: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };
const VOWEL = /[aeiouáéíóúü]/;
// A strong vowel heads its own syllable against another strong one ("le-er"); an accented í / ú
// breaks a diphthong the same way ("ma-íz").
const STRONG = /[aeoáéíóú]/;

/** The syllable nuclei of a word, as [start, end) spans of its vowels. */
function nuclei(word: string): Array<[number, number]> {
  const spans: Array<[number, number]> = [];
  for (let i = 0; i < word.length; i++) {
    if (!VOWEL.test(word[i])) continue;
    const last = spans[spans.length - 1];
    const joins = last && last[1] === i && !(STRONG.test(word[i - 1]) && STRONG.test(word[i]));
    if (joins) last[1] = i + 1;
    else spans.push([i, i + 1]);
  }
  return spans;
}

/**
 * Attach an object clitic to the end of a Spanish verb form — an infinitive or an affirmative
 * command ("comerlo", "cómelo", "comámoslo", "comedlo", "veme"). The stress stays on the verb's own
 * syllable, so the written accent follows the general rules for the longer word: it is added when the
 * stress now falls three syllables or more from the end ("come" → "cómelo"), and a verb's own accent
 * is dropped when it no longer needs one ("está" → "estate"). A no-op with no clitic.
 *
 * Two junctions lose a letter: the 1st plural's -s before "nos" ("volvamos" + "nos" → "volvámonos")
 * and the 2nd plural's -d before "os" ("volved" + "os" → "volveos").
 */
export function esEnclitic(verb: string, clitic: string): string {
  if (!clitic) return verb;
  const joined = attach(verb, clitic);
  const drops = (/mos$/.test(verb) && clitic.startsWith('nos')) || (/d$/.test(verb) && clitic.startsWith('os'));
  return drops ? `${joined.slice(0, verb.length - 1)}${joined.slice(verb.length)}` : joined;
}

/** `esEnclitic` without the junction losses: the clitic attached and the accent placed. */
function attach(verb: string, clitic: string): string {
  const spans = nuclei(verb);
  if (spans.length === 0) return `${verb}${clitic}`;
  // The stressed nucleus: the one carrying a written accent, else the penultimate for a word ending
  // in a vowel, -n or -s, else the last.
  const accented = spans.findIndex(([s, e]) => /[áéíóú]/.test(verb.slice(s, e)));
  const stressed = accented >= 0 ? accented
    : /[aeiouns]$/.test(verb) && spans.length > 1 ? spans.length - 2 : spans.length - 1;
  const plain = [...verb].map((c) => PLAIN[c] ?? c).join('');
  const word = `${plain}${clitic}`;
  if (nuclei(word).length - stressed < 3) return word;
  // Mark the stressed nucleus: its strong vowel, or the second of two weak ones.
  const [s, e] = spans[stressed];
  const nucleus = plain.slice(s, e);
  const strong = nucleus.search(/[aeo]/);
  const at = s + (strong >= 0 ? strong : nucleus.length - 1);
  return `${word.slice(0, at)}${ACCENT[word[at]] ?? word[at]}${word.slice(at + 1)}`;
}
