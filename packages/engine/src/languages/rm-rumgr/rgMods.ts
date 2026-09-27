import type { ResolvedNounPhrase } from '../../types.js';
import { REL_PREP_RG } from './rumgr.consts.js';
import { adBeforeVowel } from './adBeforeVowel.js';
import { agreeAdj } from './agreeAdj.js';
import { isPlural } from './isPlural.js';
import { joinArt } from './joinArt.js';
import { prepArt } from './prepArt.js';
import { surface } from './surface.js';

/**
 * Postnominal attributive nouns as a bare "prep + noun" string ("a vela", "da frasas semanticas").
 * The modifier is a real noun: it takes its own number, and its adjectives agree with *its* gender and
 * number, not the head's. A `domain` contracts its *da* with the generic definite article ("mustga dal
 * fritg").
 */
export function rgMods(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const forms = m.concept.forms;
      const plural = isPlural(forms);
      const noun = surface(forms, plural);
      if (!noun) return '';
      const gender = forms['gender'] ?? 'masc';
      const adjs = m.adjectives
        .map((a) => agreeAdj(a.forms, gender, plural))
        .filter(Boolean)
        .join(' ');
      const nounPart = adjs ? `${noun} ${adjs}` : noun;
      const prep = REL_PREP_RG[m.relation];
      return m.relation === 'domain' ? joinArt(prepArt(prep, forms, plural), nounPart) : `${adBeforeVowel(prep, nounPart)} ${nounPart}`;
    })
    .filter(Boolean)
    .join(' ');
}
