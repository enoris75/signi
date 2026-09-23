import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { superlativeLead } from '../../functions/superlativeLead.js';
import type { Case } from './de.types.js';
import { declineAdj } from './declineAdj.js';
import { deDegPrefix } from './deDegPrefix.js';
import { deDegStem } from './deDegStem.js';
import { defArticle } from './defArticle.js';

/**
 * A predicate superlative **with its set** ("ist das größte der Tiere") — P09-E19. The bare one is
 * the fixed "am …sten" frame (`dePredAdj`), which takes no set: "*am größten der Tiere" is not
 * German. With a set the superlative is nominalised as an ordinal is (`dePredOrdinal`): the definite
 * article, the superlative stem declined weak after it — "der größte", "die schönste", "die größten",
 * "der am wenigsten große" — but **lower-case**, because its noun is understood from the set (*das
 * größte der Tiere* is *das größte Tier der Tiere*), where the ordinal's rank has nothing after it.
 *
 * The gender is that understood noun's: the head of a set that is a single plural noun ("der Kater
 * ist **das** größte der Tiere", *Tier* being neuter). A singular collective, a pronoun or a
 * coordinated set names no one noun, and the gender falls back on what the predicate is said of,
 * `agreement` — "die Frau ist **die** schönste der Familie", "der Kater ist **der** größte von uns".
 * The number is always `agreement`'s ("die Kater sind die größten der Tiere"). A superlative's own
 * intensifier stands before the article ("bei weitem der größte", A257).
 */
export function dePredSuperlative(
  a: ConceptForms,
  agreement: Record<string, string>,
  set: ResolvedNounElement | undefined,
  _case: Case = 'nom',
): string {
  const base = a.forms['base'] ?? '';
  if (!base) return '';
  const only = set?.conjuncts.length === 1 ? set.conjuncts[0]?.head.forms : undefined;
  const understood = only && !only['person'] && (only['number'] ?? only['count']) === 'plural' ? only['gender'] : undefined;
  const gender = understood ?? agreement['gender'] ?? 'neut';
  const plural = (agreement['number'] ?? agreement['count']) === 'plural';
  const { lead, adjective } = superlativeLead(a);
  const word = `${deDegPrefix(adjective)}${declineAdj(deDegStem(adjective, base), _case, gender, plural, 'definite')}`;
  return [lead, defArticle({ gender }, _case, plural), word].filter(Boolean).join(' ');
}
