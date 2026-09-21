import type { Case } from './de.types.js';
import { weakN } from './weakN.js';

// A vowel sound, counting a diphthong or a doubled vowel as one: "Feuer" has two, "Tier" one.
const VOWEL_SOUND = /ai|au|äu|ei|eu|ie|aa|ee|oo|[aeiouäöüy]/gi;

/**
 * A noun's genitive singular form ("des Wortes", "des Katers", "des Jungen", "Europas"). A feminine
 * common noun or a plural takes no ending at all: there the article alone marks the case ("einer
 * Katze", "der Wörter"). Otherwise, in order:
 *
 * - a genitive the lexicon records (`forms.genitive`) wins, for the nouns no rule gets right: the
 *   weak-but-s "Namens", an unmarked loanword ("des Numerus", "des Englisch"), a loanword's short
 *   "-s" ("des Slots");
 * - a weak masculine takes -(e)n, never an -(e)s ("des Jungen", "des Menschen");
 * - a proper name takes a bare -s ("Europas", "Asiens"), and nothing after a sibilant;
 * - -nis doubles its s ("des Ergebnisses");
 * - a sibilant or -sch needs the long -es, where a bare -s would be unpronounceable ("des Hauses",
 *   "des Satzes", "des Fuchses", "des Geräusches");
 * - a vowel-final word takes -s ("des Gebäudes");
 * - a monosyllable takes -es, the standard form there ("des Hundes"), and a longer word -s ("des
 *   Katers", "des Engels", "des Feuers").
 *
 * The recorded genitive replaces the lemma at the end of `word`, so a compound keeps its front
 * ("Vornamens"). The adjective-less modifiers `germanCompound` prefixes are the only front a word has.
 */
export function genitiveS(word: string, _case: Case, forms: Record<string, string>, plural: boolean): string {
  if (_case !== 'gen' || plural || !word) return word;
  // A name with no article to carry the case takes its -s whatever its gender ("Annas"); an articled
  // feminine name leaves it to the article ("der Antarktis").
  const bareName = forms['proper'] === '1' && forms['takes_article'] !== '1';
  if ((forms['gender'] ?? 'neut') === 'fem' && !bareName) return word;
  const recorded = forms['genitive'];
  const base = forms['base'] ?? '';
  if (recorded && base && word.toLowerCase().endsWith(base.toLowerCase())) {
    const front = word.slice(0, word.length - base.length);
    return front ? `${front}${recorded.charAt(0).toLowerCase()}${recorded.slice(1)}` : recorded;
  }
  if (forms['weak'] === '1') return weakN(word, 'gen', false);
  if (forms['proper'] === '1') return /[sßxz]$/i.test(word) ? word : `${word}s`;
  if (/nis$/i.test(word)) return `${word}ses`;
  if (/(?:s|ß|z|x|sch)$/i.test(word)) return `${word}es`;
  if (/[aeiouäöüy]$/i.test(word)) return `${word}s`;
  const syllables = (word.match(VOWEL_SOUND) ?? []).length;
  return syllables <= 1 ? `${word}es` : `${word}s`;
}
