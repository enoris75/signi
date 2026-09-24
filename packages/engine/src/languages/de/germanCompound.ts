import type { ResolvedNounPhrase } from '../../types.js';
import { compoundStem } from './compoundStem.js';
import { isGenitiveModifier } from './modifierGenitives.js';

/**
 * German realises an attributive noun as a closed compound ("Segel" + "Boot" →
 * "Segelboot"): the modifiers are prefixed onto the head and every element but the first
 * has its initial lowercased. The relation is neutralised. Each modifier enters in its compound
 * stem, linking element and all ("Phrasenschöpfer", "Geschwindigkeitswort", see `compoundStem`).
 * Gender/declension stay the head's (the compound's last element), so only the surface `word`
 * changes.
 */
export function germanCompound(np: ResolvedNounPhrase, headWord: string): string {
  // A modifier that carries its own adjective can't join the compound — German has no way to put
  // an adjective *inside* a compound — so it breaks out into a postposed bare genitive instead
  // (see `modifierGenitives`). So does one whose name holds an adjective or a genitive of its own
  // (YOUNG_WOMAN's "jung", LOCATIVE's "des Ortes"; A295). Only the others prefix onto the head here.
  const mods = np.nounModifiers
    .filter((m) => !isGenitiveModifier(m))
    .map((m) => compoundStem(m.concept.forms))
    .filter(Boolean);
  if (!mods.length || !headWord) return headWord;
  return [...mods, headWord]
    .map((p, i) => (i === 0 ? p : p.charAt(0).toLowerCase() + p.slice(1)))
    .join('');
}
