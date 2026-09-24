import type { ResolvedComplement, ResolvedNounPhrase } from '../types.js';
import { directionSpecifier } from './directionSpecifier.js';
import { isIdiomNoun } from './locativeIdiom.js';

/**
 * The fixed, article-less goal a hearth noun takes under a `direction` — "goes **home**", *va a
 * casa*, *va à la maison*, *geht nach Hause*, *va a casa*, *vai para casa* (P09-E37) — or
 * `undefined` when this conjunct is an ordinary goal. Each engine keeps its own `DIRECTION_IDIOMS`
 * beside its `LOCATIVE_IDIOMS` (see `locativeIdiom`), keyed by concept id: the two are different
 * words in most languages (*zu Hause* / *nach Hause*, *en casa* / *a casa*).
 *
 * It holds for the plain goal only — a direction naming a relation ("goes into the home", "behind
 * the home") is a place again — and on the same plain noun the locative idiom takes: a determiner
 * the user chose ("goes to this home", "to a home"), a plural or any modifier keeps the ordinary path.
 */
export function directionIdiom(
  c: ResolvedComplement,
  np: ResolvedNounPhrase,
  idioms: Readonly<Record<string, string>>,
): string | undefined {
  return directionSpecifier(c) === undefined && isIdiomNoun(np) ? idioms[np.head.conceptId] : undefined;
}
