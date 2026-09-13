import type { ResolvedNounPhrase } from '../../types.js';

/**
 * Attributive nouns as a bare prenominal string ("sail" in "sail boat"). English
 * neutralises the relation entirely — the noun is just juxtaposed before the head — and
 * keeps the attributive noun singular ("phrase creator"), ignoring the modifier's number.
 * The modifier's own adjectives are bare and prenominal ("semantic phrase creator").
 */
export function nounMods(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const noun = m.concept.forms['base'];
      if (!noun) return '';
      const adjs = m.adjectives.map((a) => a.forms['base'] ?? '').filter(Boolean).join(' ');
      return adjs ? `${adjs} ${noun}` : noun;
    })
    .filter(Boolean)
    .join(' ');
}
