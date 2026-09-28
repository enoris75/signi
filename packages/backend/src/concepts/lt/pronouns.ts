import type { LanguageColumn } from '../types.js';

// The pronouns (P18-E7, style-lt.md § Adverbs, pronouns, interjections). Polish's `person`, `number`,
// `gender`, `generic`, `thing`, `with_other` and `negative_with_other` are mirrored, and its case keys:
//
// - `base` (nominative), `gen, dat, acc, ins, loc`;
// - the 3rd person's other variants under `fem_`, `plural_` and `plural_fem_`, the nominatives
//   `singular_fem`, `plural`, `plural_fem`; *mes/jūs* are `plural` + `plural_*` on the 1st and 2nd;
// - SOMETHING/SOMEONE's negative (*niekas*) under `negative` + `negative_*`, and the *else* phrases
//   (`with_other`, `negative_with_other`) with their cases under the same suffixes.
//
// Lithuanian has no clitic and no post-preposition form, so none of Polish's `_short` or `prep_` keys,
// and no neuter personal pronoun, so no `singular_neut` / `neut_`. The reflexive *savęs, sau, save,
// savimi, savyje* is one paradigm for every person, the engine's. Every form is (verify) until the
// native review (P18-E12).

type Forms = Record<string, string>;
const CASES = ['gen', 'dat', 'acc', 'ins', 'loc'] as const;

/** The five oblique cases (gen, dat, acc, ins, loc) of `list` under `prefix` (`fem_gen`, `plural_loc`, …). */
function cases(prefix: string, list: string): Forms {
  const parts = list.split(',').map((s) => s.trim());
  if (parts.length !== 5) throw new Error(`lt pronoun ${prefix}: expected 5 cases in "${list}"`);
  return Object.fromEntries(CASES.map((c, i) => [`${prefix}${c}`, parts[i]!]));
}

// Lithuanian says *someone* and *something* with one word, *kažkas*, and *nobody* and *nothing* with
// one, *niekas*: SOMETHING and SOMEONE differ only in the agreement gender (*kažkas atsitiko* vs
// *kažkas atėjo pavargęs*).
const KAZKAS = cases('', 'kažko, kažkam, kažką, kažkuo, kažkame');
const NIEKAS = { negative: 'niekas', ...cases('negative_', 'nieko, niekam, nieką, niekuo, niekame') };

export const LT_PRONOUNS: LanguageColumn = {
  FIRST_PERSON: {
    base: 'aš', person: '1', number: 'singular',
    ...cases('', 'manęs, man, mane, manimi, manyje'),
    plural: 'mes', ...cases('plural_', 'mūsų, mums, mus, mumis, mumyse'),
  },
  SECOND_PERSON: {
    base: 'tu', person: '2', number: 'singular',
    ...cases('', 'tavęs, tau, tave, tavimi, tavyje'),
    plural: 'jūs', ...cases('plural_', 'jūsų, jums, jus, jumis, jumyse'),
  },
  THIRD_PERSON: {
    base: 'jis', person: '3', number: 'singular', gender: 'masc',
    ...cases('', 'jo, jam, jį, juo, jame'),
    singular_fem: 'ji', ...cases('fem_', 'jos, jai, ją, ja, joje'),
    plural: 'jie', ...cases('plural_', 'jų, jiems, juos, jais, juose'),
    plural_fem: 'jos', ...cases('plural_fem_', 'jų, joms, jas, jomis, jose'),
  },
  // P18 D7: the subjectless 3rd person (*čia valgo pelę*), so no word (verify: the reviewer may prefer
  // the neuter passive participle, *valgoma pelė*). Polish's `generic_reflexive` (*człowiek*, to avoid
  // *się* twice) is dropped: the subjectless reflexive needs no stand-in (*čia prausiasi*).
  GENERIC_PERSON: { base: '', person: '3', number: 'singular', generic: '1' },
  // A predicate agrees with *kažkas*, *viskas* as a neuter (*viskas gražu*); the *else* is *kita*, the
  // neuter (*kažkas kita*), which agrees in the oblique cases (*kažko kito*). Under negation the object
  // is genitive (*nieko nemato*), the engine's; the accusative *nieką* is kept for a preposition (*apie
  // nieką negalvoja*).
  SOMETHING: {
    base: 'kažkas', person: '3', number: 'singular', gender: 'neut', thing: '1',
    ...KAZKAS, ...NIEKAS,
    with_other: 'kažkas kita', ...cases('with_other_', 'kažko kito, kažkam kitam, kažką kita, kažkuo kitu, kažkame kitame'), // (verify) acc *kažką kitą*
    negative_with_other: 'niekas kita',
    ...cases('negative_with_other_', 'nieko kito, niekam kitam, nieką kita, niekuo kitu, niekame kitame'), // (verify)
  },
  // As Polish's *wszystko*, no negative: *niekas* is SOMETHING's.
  EVERYTHING: {
    base: 'viskas', person: '3', number: 'singular', gender: 'neut', thing: '1',
    ...cases('', 'viso, viskam, viską, viskuo, viskame'),
    with_other: 'visa kita', ...cases('with_other_', 'viso kito, visam kitam, visa kita, visu kitu, visame kitame'), // (verify)
  },
  SOMEONE: {
    base: 'kažkas', person: '3', number: 'singular', gender: 'masc',
    ...KAZKAS, ...NIEKAS,
  },
};
