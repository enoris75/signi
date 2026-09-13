import type { ResolvedNounPhrase } from '../../types.js';
import { REL_PREP_ES } from './es.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { coordinate } from './coordinate.js';

/**
 * Postnominal attributive nouns as bare " de noun" strings (no del contraction). The
 * modifier takes its own number and its adjectives agree with *its* gender/number
 * ("creador de frases semánticas"), postnominal as in Spanish.
 */
export function modifierText(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const forms = m.concept.forms;
      const plural = (forms['number'] ?? forms['count']) === 'plural';
      const noun = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
      if (!noun) return '';
      const gender = forms['gender'] ?? 'masc';
      const adjs = coordinate(
        m.adjectives.map((a) => agreeAdj(a.forms['base'] ?? '', gender, plural)).filter(Boolean),
      );
      const nounPart = adjs ? `${noun} ${adjs}` : noun;
      return ` ${REL_PREP_ES[m.relation]} ${nounPart}`;
    })
    .join('');
}
