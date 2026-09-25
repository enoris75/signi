import type { ResolvedNounModifier, ResolvedNounPhrase } from '../../types.js';
import { declineAdj } from './declineAdj.js';
import { postnominal } from './postnominal.js';

/**
 * Whether an attributive noun stays out of the compound: one with adjectives of its own, or one its
 * lexeme spells as an adjective or a postnominal phrase (YOUNG_WOMAN's *jung*, LOCATIVE's *vom Ort*).
 * The German fork put such a modifier in the genitive; Swiss German has none (P10 D7), and says it with
 * *vo* + the dative instead (see `modifierGenitives`).
 */
export function isGenitiveModifier(m: ResolvedNounModifier): boolean {
  const f = m.concept.forms;
  return m.adjectives.length > 0 || !!f['adjective'] || !!f['postnominal'];
}

/**
 * The attributive nouns that stay out of the compound (see `isGenitiveModifier`), after the head:
 * *vo* + the bare dative with its adjectives, "e Frag vo grosse Wichtigkeit"; a lexeme's own adjective
 * or postnominal phrase as it spells it.
 */
export function modifierGenitives(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .filter(isGenitiveModifier)
    .map((m) => {
      const f = m.concept.forms;
      const plural = (f['number'] ?? f['count']) === 'plural';
      const gender = f['gender'] ?? 'neut';
      const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
      const stems = [...m.adjectives.map((a) => a.forms['base'] ?? ''), f['adjective'] ?? ''];
      const adjs = stems.filter(Boolean).map((stem) => declineAdj(stem, 'dat', gender, plural, 'bare'));
      return ['vo', ...adjs, word].filter(Boolean).join(' ') + postnominal(f);
    })
    .filter(Boolean)
    .map((phrase) => ` ${phrase}`)
    .join('');
}
