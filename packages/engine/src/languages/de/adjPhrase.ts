import type { ResolvedNounPhrase } from '../../types.js';
import type { Case } from './de.types.js';
import { declineAdj } from './declineAdj.js';
import { deDegPrefix } from './deDegPrefix.js';
import { deDegStem } from './deDegStem.js';

// Decline every attributive adjective of a noun phrase for the given case, agreeing with
// the head's gender/number and determiner. Returns "" when there are none.
//
// Some heads carry an inherent adjective of their own — the concept YOUNG_WOMAN is one word
// in most languages but "junge Frau" in German. It can't be baked into the lemma, because
// its ending tracks case and determiner just like any other adjective, so the lexicon stores
// the bare stem in forms.adjective and it declines here. It sits closest to the noun, after
// the phrase's own adjectives ("die schönen jungen Frauen").
export function adjPhrase(np: ResolvedNounPhrase, _case: Case, definiteness = 'definite'): string {
  const f = np.head.forms;
  const gender = f['gender'] ?? 'neut';
  const plural = (f['number'] ?? f['count']) === 'plural';
  const decline = (stem: string): string => declineAdj(stem, _case, gender, plural, definiteness);
  const own = np.adjectives
    .map((a) => {
      const base = a.forms['base'];
      if (!base) return '';
      // Synthesise the comparative/superlative stem, decline it, then prefix any
      // periphrastic degree adverb ("weniger schöne", "am wenigsten schöne").
      return `${deDegPrefix(a)}${decline(deDegStem(a, base))}`;
    })
    .filter(Boolean);
  // An attributive noun's own adjective is NOT hoisted onto the head here: a modifier that carries
  // one is pulled out of the compound and rendered as a postposed genitive (see `modifierGenitives`),
  // where its adjective belongs to it — the head keeps only its own adjectives.
  const inherent = f['adjective'];
  return [...own, inherent ? decline(inherent) : ''].filter(Boolean).join(' ');
}
