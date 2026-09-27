import type { ResolvedNounPhrase } from '../../types.js';
import { REL_PREP_CA } from './ca.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { coordinate } from './coordinate.js';
import { deDet } from './deDet.js';

/**
 * Postnominal attributive nouns as " de noun" strings, bare: "creador de frases semàntiques". The
 * modifier takes its own number and its adjectives agree with *it*. A `domain` takes the generic
 * definite article ("mosca de la fruita").
 */
export function modifierText(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const forms = m.concept.forms;
      const plural = (forms['number'] ?? forms['count']) === 'plural';
      const noun = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
      if (!noun) return '';
      const gender = forms['gender'] ?? 'masc';
      const adjs = coordinate(m.adjectives.map((a) => agreeAdj(a.forms, gender, plural)).filter(Boolean));
      const nounPart = adjs ? `${noun} ${adjs}` : noun;
      return ` ${m.relation === 'domain' ? deDet({ ...forms, definiteness: 'definite' }, plural) : REL_PREP_CA[m.relation]} ${nounPart}`;
    })
    .join('');
}
