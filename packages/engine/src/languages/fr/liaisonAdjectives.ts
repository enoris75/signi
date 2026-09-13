import { FR_ADJ_IRREGULAR } from './fr.consts.js';
import { elidesBefore } from './elidesBefore.js';

/**
 * The prenominal adjectives of a noun, with beau / nouveau / vieux in their masculine singular form
 * before a vowel sound: "un bel ange", "le vieil homme", "ce nouvel argent". Each is judged against
 * the word after it, the next prenominal adjective or else the noun, through `elidesBefore` so a
 * mute h counts ("homme"). `forms` are the noun's; the feminine and the plural keep their forms.
 * A degree word in front ("très beau") is left alone; only the adjective itself changes.
 */
export function liaisonAdjectives(pre: string[], forms: Record<string, string>, noun: string, plural: boolean): string[] {
  if (plural || forms['gender'] === 'fem') return pre;
  return pre.map((word, i) => {
    const last = word.slice(word.lastIndexOf(' ') + 1);
    const irr = FR_ADJ_IRREGULAR[last];
    if (!irr || !elidesBefore(forms, pre[i + 1] ?? noun)) return word;
    return `${word.slice(0, word.length - last.length)}${irr[4]}`;
  });
}
