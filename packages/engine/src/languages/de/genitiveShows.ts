import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { keptBesidePossessive } from '../../possessive.js';
import { adjPhrase } from './adjPhrase.js';
import { articledNameForms } from './articledNameForms.js';
import { determiner } from './determiner.js';
import { genitiveS } from './genitiveS.js';

// The mass quantifiers "etwas / viel / wenig" (and P09-E25's "genug") are invariant: they carry no case to show.
const INVARIANT_MASS_DETERMINERS: ReadonlySet<string> = new Set(['some', 'many', 'few', 'enough']);

/**
 * Whether a noun phrase's genitive would show. Standard German puts a noun possessor, and the object
 * of "wegen", in the genitive, but only where something marks it: an inflected determiner or
 * possessive ("des Katers", "eines Hundes", "keiner Katze", "dieser Katzen", "meines Hundes", "einiger
 * Kater"), a strong adjective ending ("kleiner Katzen"), or a name's own -s ("Europas"). Where nothing
 * does, German takes the dative: "das Buch von Katzen", "von Wasser", "von etwas Wasser", "wegen
 * Männern". A common noun's own -(e)s alone does not carry an article-less genitive ("*das Buch
 * Wassers"), so only a name counts on it.
 *
 * `forms` are the head forms the determiner reads; they default to the phrase's own, with a modified
 * bare name articled (see `articledNameForms`).
 */
export function genitiveShows(np: ResolvedNounPhrase, forms: Record<string, string> = articledNameForms(np)): boolean {
  // A prenominal possessive is an inflected ein-word. One detached beside a kept determiner ("von mir")
  // marks no case, so the head's own determiner decides, as without it (A326).
  if (np.possessor && isPronominalPossessor(np.possessor) && !keptBesidePossessive(np.head.forms)) return true;
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  if (forms['proper'] === '1') {
    const base = forms['base'] ?? '';
    return forms['takes_article'] === '1' || genitiveS(base, 'gen', forms, plural) !== base;
  }
  const definiteness = forms['definiteness'] ?? 'definite';
  if (forms['uncountable'] === '1' && INVARIANT_MASS_DETERMINERS.has(definiteness)) return false;
  // "genug" is invariant on a count noun too, so only a strong adjective can show the case: "das Buch
  // von genug Katern", but "das Buch genug kleiner Katzen" (P09-E25).
  if (definiteness === 'enough') return adjPhrase(np, 'gen', definiteness) !== '';
  return determiner(forms, 'gen', plural) !== '' || adjPhrase(np, 'gen', definiteness) !== '';
}
