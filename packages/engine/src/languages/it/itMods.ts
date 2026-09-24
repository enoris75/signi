import type { ResolvedNounPhrase } from '../../types.js';
import { REL_PREP_IT } from './it.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { isPlural } from './isPlural.js';
import { joinArt } from './joinArt.js';
import { prepArt } from './prepArt.js';
import { surface } from './surface.js';

/**
 * Postnominal attributive nouns as a bare "prep + noun" string ("a vela", "di frasi
 * semantiche"). The modifier is a real noun: it takes its own number and its adjectives
 * agree with *its* gender/number, not the head's ("creatore di frasi semantiche"). A `domain` fuses its "di"
 * with the generic definite article ("mosca della frutta", "mosche dell'isola").
 */
export function itMods(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const forms = m.concept.forms;
      const plural = isPlural(forms);
      const noun = surface(forms, plural);
      if (!noun) return '';
      const gender = forms['gender'] ?? 'masc';
      const adjs = m.adjectives
        .map((a) => agreeAdj(a.forms['base'] ?? '', gender, plural))
        .filter(Boolean)
        .join(' ');
      const nounPart = adjs ? `${noun} ${adjs}` : noun;
      const prep = REL_PREP_IT[m.relation];
      return m.relation === 'domain' ? joinArt(prepArt(prep, forms, plural), nounPart) : `${prep} ${nounPart}`;
    })
    .filter(Boolean)
    .join(' ');
}
