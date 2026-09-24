import type { ResolvedNounPhrase } from '../../types.js';
import { REL_PREP_PT } from './pt.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { dePrep } from './dePrep.js';

/**
 * Postnominal attributive nouns as bare "prep noun" strings ("barco a vela", "óculos de
 * sol"). The modifier takes its own number and its adjectives agree with *its*
 * gender/number ("criador de frases semânticas"), postnominal as in Portuguese. A `domain`
 * takes the generic definite article, contracted ("mosca da fruta", "moscas do tempo").
 */
export function modifierText(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const forms = m.concept.forms;
      const plural = (forms['number'] ?? forms['count']) === 'plural';
      const noun = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
      if (!noun) return '';
      const gender = forms['gender'] ?? 'masc';
      const adjs = m.adjectives
        .map((a) => agreeAdj(a.forms['base'] ?? '', gender, plural))
        .filter(Boolean)
        .join(' e ');
      const nounPart = adjs ? `${noun} ${adjs}` : noun;
      return ` ${m.relation === 'domain' ? dePrep(forms, plural) : REL_PREP_PT[m.relation]} ${nounPart}`;
    })
    .join('');
}
