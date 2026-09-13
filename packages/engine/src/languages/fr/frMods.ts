import type { ResolvedNounPhrase } from '../../types.js';
import { REL_PREP_FR, VOWEL_START } from './fr.consts.js';
import { agreeAdjFr } from './agreeAdjFr.js';

/**
 * Postnominal attributive nouns as a bare "prep + noun" string ("de phrases sémantiques");
 * "de" elides before a vowel. The modifier takes its own number and its adjectives agree
 * with *its* gender/number ("créateur de phrases sémantiques"), postnominal as in French.
 */
export function frMods(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const forms = m.concept.forms;
      const plural = (forms['number'] ?? forms['count']) === 'plural';
      const noun = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
      if (!noun) return '';
      const gender = forms['gender'] ?? 'masc';
      const adjs = m.adjectives
        .map((a) => agreeAdjFr(a.forms['base'] ?? '', gender, plural))
        .filter(Boolean)
        .join(' ');
      const nounPart = adjs ? `${noun} ${adjs}` : noun;
      const prep = REL_PREP_FR[m.relation];
      // Elision keys on the noun that immediately follows "de" (the adjective is postnominal).
      return prep === 'de' && VOWEL_START.test(noun) ? `d'${nounPart}` : `${prep} ${nounPart}`;
    })
    .filter(Boolean)
    .join(' ');
}
