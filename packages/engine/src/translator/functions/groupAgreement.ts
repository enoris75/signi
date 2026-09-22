import type { CoordConjunction } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { AGREEMENT_KEYS, OR_RESOLVES_MIXED_PERSONS } from '../translator.consts.js';

/**
 * The person / number / gender a coordinated group agrees as. The rules are the same in the six
 * languages that agree at all (ja agrees with nothing), so they live here rather than per engine:
 *
 *  · **and** — the group is plural whatever its conjuncts are ("Peter and Paul **speak**"), takes
 *    the lowest person of them (1 ≺ 2 ≺ 3: "you and I **are**" is 1st plural), and, in the
 *    languages that resolve gender, is feminine only if *every* conjunct is — one masculine
 *    conjunct masculinises the whole ("il gatto e la volpe sono stanch**i**").
 *  · **or** — the group agrees with the conjunct *nearest* the verb, i.e. the last ("Peter or the
 *    boys **speak**", "o Pietro o i ragazzi parl**ano**"): the disjunction asserts one of them,
 *    not both, so there is no group to resolve. French is the exception when the conjuncts differ
 *    in person (`OR_RESOLVES_MIXED_PERSONS`): the group resolves as under **and**.
 *
 * A single conjunct resolves to its own head's forms untouched, which is exactly what the engines
 * read before coordination existed.
 */
export function groupAgreement(
  conjuncts: ResolvedNounPhrase[],
  conjunction: CoordConjunction,
  language: string,
): Record<string, string> {
  const last = conjuncts[conjuncts.length - 1].head.forms;
  const persons = conjuncts.map((c) => c.head.forms['person'] ?? '3');
  const resolves = conjunction === 'and'
    || (conjunction === 'or' && OR_RESOLVES_MIXED_PERSONS.has(language) && new Set(persons).size > 1);
  const features: Record<string, string> =
    // Disjunction: the nearest conjunct is the one the verb agrees with — take its features whole.
    !resolves
      ? Object.fromEntries(AGREEMENT_KEYS.filter((k) => last[k] !== undefined).map((k) => [k, last[k]]))
      : (() => {
          const person = ['1', '2', '3'].find((p) => persons.includes(p)) ?? '3';
          const feminine = conjuncts.every((c) => c.head.forms['gender'] === 'fem');
          return { person, number: 'plural', gender: feminine ? 'fem' : 'masc' };
        })();
  // The negative determiner is not agreement, but it *is* a fact about the whole group that the
  // engines read off the subject: French negates on "aucun" alone ("aucun garçon ne pleure"), so
  // a group with any negative conjunct still triggers the concord.
  if (conjuncts.some((c) => c.head.forms['definiteness'] === 'no')) features['definiteness'] = 'no';
  // So is being an animal, which German EAT reads to pick "fressen" over "essen" (`subject_sense`):
  // only a group whose *every* conjunct is one, since "fressen" said of a person is an insult.
  if (conjuncts.every((c) => c.head.forms['animal'] === '1')) features['animal'] = '1';
  return features;
}
