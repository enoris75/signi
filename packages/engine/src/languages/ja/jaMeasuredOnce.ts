import type { TemporalRelation } from '@signi/shared';
import type { ResolvedNounElement } from '../../types.js';

// The relations that measure their time rather than place the act at it: a deadline (以内に), a
// duration (the bare measure), a stretch the act sits inside (の間に) and a distance back from now (前に).
const MEASURING: ReadonlySet<TemporalRelation> = new Set<TemporalRelation>(['within', 'for', 'during', 'ago']);

/**
 * A measuring time's phrase with each indefinite singular measure noun counted as one (A322). A time
 * word that is its own counter (`counter_join: 'head'`: HOUR 時間, DAY 日) says "an hour" with the
 * numeral, since an article says nothing in Japanese: 一時間以内に, 一時間走ります, 一日の間に, 一時間前に.
 * Left bare, the noun reads as the word alone — 時間以内に is "within time", and 時間 is TIME's own word.
 * Outside a measure the indefinite stays bare: as a subject or object (時間は燃えます) or at a point
 * in time (時間に), where 一 would be odd. A word with no counter of its own (TIME) is left alone.
 *
 * A plural, indefinite or bare, under `for` is an unspecified many, which `jaCounted` writes 何 + the
 * counter + も (`many`: 何時間も走ります, 何日も, 何年も, A348). Under the other measuring relations it is
 * an unspecified few, 数 + the counter (`few`: 数時間以内に, 数日の間に, 数年前に, A362). The plural
 * reaches here as `plural_unmarked`, since a Japanese noun has no plural word to keep `number` plural.
 * A definite plural is left alone (猫は時間走ります; not ruled on).
 */
export function jaMeasuredOnce(phrase: ResolvedNounElement, relation: TemporalRelation): ResolvedNounElement {
  if (!MEASURING.has(relation)) return phrase;
  return {
    ...phrase,
    conjuncts: phrase.conjuncts.map((np) => {
      const f = np.head.forms;
      const plural = (f['number'] ?? f['count']) === 'plural';
      const measure = f['counter_join'] === 'head' && f['numeral'] === undefined;
      // An unspecified plural is 何 + the counter + も under `for`, "for hours on end" (A348), and 数 +
      // the counter under within, during and ago, "within hours", "hours ago" (A362).
      if (measure && (plural || f['plural_unmarked'] === '1')
        && (f['definiteness'] === 'indefinite' || f['definiteness'] === 'bare')) {
        return { ...np, head: { ...np.head, forms: { ...f, [relation === 'for' ? 'many' : 'few']: '1' } } };
      }
      const once = measure && f['definiteness'] === 'indefinite' && !plural;
      return once ? { ...np, head: { ...np.head, forms: { ...f, numeral: '1' } } } : np;
    }),
  };
}
