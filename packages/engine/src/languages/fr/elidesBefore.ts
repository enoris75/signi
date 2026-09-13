import { VOWEL_START } from './fr.consts.js';

/**
 * Whether the article elides before a phrase whose lead word is `lead`. French elides before a
 * vowel SOUND: a first-letter test catches true vowels but misses an h muet ("homme" → l'homme)
 * and must NOT fire for an h aspiré ("héros" → le héros). That split is lexical, so a noun the
 * corpus marks `elides` counts as vowel-initial. The flag is the head noun's, so it is honoured
 * only when the noun itself leads — a prenominal adjective (never h muet in the lexicon) is judged
 * on its own spelling.
 */
export function elidesBefore(forms: Record<string, string>, lead: string): boolean {
  if (VOWEL_START.test(lead)) return true;
  const nounLeads = lead === forms['base'] || lead === forms['plural'];
  return nounLeads && forms['elides'] === '1';
}
