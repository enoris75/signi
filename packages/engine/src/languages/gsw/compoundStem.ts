import { FUGEN_S_ANY, FUGEN_S_FEMININE } from './gsw.consts.js';
import { weakN } from './weakN.js';

/**
 * The form a noun takes as the first element of a compound, its linking element (Fugenelement)
 * included (B10). Which one a noun takes is partly lexical, so a `compound` stem the lexicon seeds
 * wins: the -e(s)- of "Hunde-", "Lebens-", "Inhalts-", the plural of "Kinder-", the dropped -e of
 * "Sprach-". Without one the suffix rule decides:
 *  - -s- after the feminine suffixes -ung/-heit/-keit/-schaft/-ion/-tät, and after -ling/-tum
 *    ("Übersetzungsserver", "Geschwindigkeitswort");
 *  - -n- after a feminine -e ("Phrasenschöpfer", "Tastenkombination");
 *  - a weak masculine's oblique -(e)n ("Jungenbuch", "Ochsenschwanz");
 *  - nothing otherwise ("Wortschöpfer", "Segelboot").
 */
export function compoundStem(forms: Record<string, string>): string {
  const stored = forms['compound'];
  if (stored) return stored;
  const base = forms['base'] ?? '';
  if (!base) return '';
  const feminine = forms['gender'] === 'fem';
  const ends = (suffixes: readonly string[]) => suffixes.some((s) => base.endsWith(s));
  if ((feminine && ends(FUGEN_S_FEMININE)) || ends(FUGEN_S_ANY)) return `${base}s`;
  if (feminine && base.endsWith('e')) return `${base}n`;
  if (forms['weak'] === '1') return weakN(base, 'dat', false);
  return base;
}
