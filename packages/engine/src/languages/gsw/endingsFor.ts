import type { Case, Slot } from './gsw.types.js';
import { MIXED_ENDINGS, STRONG_DAT, STRONG_ENDINGS, WEAK_ENDINGS } from './gsw.consts.js';

/**
 * The attributive adjective's ending, by the determiner in front of it (the Dieth style sheet): none
 * after the definite article in the singular (*de gross Hund*), *-e / -i / -es* after the indefinite
 * (*en grosse Hund, e grossi Chatz, es grosses Huus*) and with no article at all, and *-e* in every
 * dative (*em grosse Hund*). Nominative and accusative decline alike (P10 D7); a genitive slot takes
 * the dative.
 */
export function endingsFor(_case: Case, definiteness: string, plural: boolean): Record<Slot, string> {
  if (_case === 'dat' || _case === 'gen') return definiteness === 'bare' || definiteness === 'enough' ? STRONG_DAT : WEAK_ENDINGS.dat;
  const c = _case === 'acc' ? 'acc' : 'nom';
  if (definiteness === 'bare') return STRONG_ENDINGS[c];
  if (definiteness === 'indefinite') return plural ? STRONG_ENDINGS[c] : MIXED_ENDINGS[c];
  if (definiteness === 'such' && !plural) return MIXED_ENDINGS[c];
  if (definiteness === 'no') return plural ? STRONG_ENDINGS[c] : MIXED_ENDINGS[c];
  if (definiteness === 'some' || definiteness === 'many' || definiteness === 'few' ||
      definiteness === 'several' || definiteness === 'enough')
    return STRONG_ENDINGS[c];
  return WEAK_ENDINGS[c]; // 'all', 'this', 'that' and 'definite'
}
