import type { ResolvedNounPhrase } from '../../types.js';
import { REL_PREP_IT } from './it.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { isPlural } from './isPlural.js';
import { surface } from './surface.js';

/**
 * Postnominal attributive nouns as a bare "prep + noun" string ("a vela", "di frasi
 * semantiche"). The modifier is a real noun: it takes its own number and its adjectives
 * agree with *its* gender/number, not the head's ("creatore di frasi semantiche").
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
      return `${REL_PREP_IT[m.relation]} ${nounPart}`;
    })
    .filter(Boolean)
    .join(' ');
}
