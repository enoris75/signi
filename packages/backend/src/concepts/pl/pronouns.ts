import type { LanguageColumn } from '../types.js';

// The pronouns (style-pl.md § Pronouns). Spanish's `person`, `number`, `gender`, `generic`, `thing`,
// `with_other` and `negative_with_other` are mirrored; its `disjunctive`/`object`/`dative` are replaced
// by the case keys:
//
// - `base` (nominative), `gen, dat, acc, ins, loc` — the full (stressed) forms;
// - `gen_short, dat_short, acc_short` — the clitic, only where one exists (*mi, ci, cię, go, mu*);
// - `prep_gen … prep_loc` — the 3rd person's *n*-forms after a preposition (*do niego, z nią*);
// - the 3rd person's other variants under `fem_`, `neut_`, `plural_` (virile) and `plural_fem_`
//   (non-virile), the nominatives `singular_fem`, `singular_neut`, `plural`, `plural_fem` as Spanish
//   names them; *my/wy* are `plural` + `plural_*` on the 1st and 2nd person;
// - SOMETHING/SOMEONE's negative (*nic, nikt*) under `negative` + `negative_*`, and the *else* phrases
//   (`with_other`, `negative_with_other`) with their cases under the same suffixes.
//
// The reflexive *siebie/sobie/sobą/się* is not stored: it is one paradigm for every person, the
// engine's. Every form is (verify) until the native review (P05-E11).

type Forms = Record<string, string>;
const CASES = ['gen', 'dat', 'acc', 'ins', 'loc'] as const;

/** The five oblique cases (gen, dat, acc, ins, loc) of `list` under `prefix` (`fem_gen`, `prep_loc`, …). */
function cases(prefix: string, list: string): Forms {
  const parts = list.split(',').map((s) => s.trim());
  if (parts.length !== 5) throw new Error(`pl pronoun ${prefix}: expected 5 cases in "${list}"`);
  return Object.fromEntries(CASES.map((c, i) => [`${prefix}${c}`, parts[i]!]));
}

export const PL_PRONOUNS: LanguageColumn = {
  // *mnie* is both the full and the unstressed genitive/accusative; only the dative has a clitic, *mi*.
  FIRST_PERSON: {
    base: 'ja', person: '1', number: 'singular',
    ...cases('', 'mnie, mnie, mnie, mną, mnie'), dat_short: 'mi',
    plural: 'my', ...cases('plural_', 'nas, nam, nas, nami, nas'),
  },
  SECOND_PERSON: {
    base: 'ty', person: '2', number: 'singular',
    ...cases('', 'ciebie, tobie, ciebie, tobą, tobie'), gen_short: 'cię', dat_short: 'ci', acc_short: 'cię',
    plural: 'wy', ...cases('plural_', 'was, wam, was, wami, was'),
  },
  // Polish has a neuter personal pronoun, *ono* (Spanish *ello*).
  THIRD_PERSON: {
    base: 'on', person: '3', number: 'singular', gender: 'masc',
    ...cases('', 'jego, jemu, jego, nim, nim'), gen_short: 'go', dat_short: 'mu', acc_short: 'go',
    ...cases('prep_', 'niego, niemu, niego, nim, nim'),
    singular_fem: 'ona', ...cases('fem_', 'jej, jej, ją, nią, niej'), ...cases('fem_prep_', 'niej, niej, nią, nią, niej'),
    singular_neut: 'ono', ...cases('neut_', 'jego, jemu, je, nim, nim'), neut_gen_short: 'go', neut_dat_short: 'mu',
    ...cases('neut_prep_', 'niego, niemu, nie, nim, nim'),
    plural: 'oni', ...cases('plural_', 'ich, im, ich, nimi, nich'), ...cases('plural_prep_', 'nich, nim, nich, nimi, nich'),
    plural_fem: 'one', ...cases('plural_fem_', 'ich, im, je, nimi, nich'), ...cases('plural_fem_prep_', 'nich, nim, nie, nimi, nich'),
  },
  // The impersonal *się* (P05 D5: *je się mysz*). A reflexive verb, which would say *się* twice, takes
  // *człowiek* instead (*człowiek się myje*), as Spanish's `generic_reflexive` *uno* (verify).
  GENERIC_PERSON: { base: 'się', person: '3', number: 'singular', generic: '1', generic_reflexive: 'człowiek' },
  // *coś* agrees as a neuter (*coś się stało*); its *else* takes the adjective in the genitive in the
  // nominative/accusative (*coś innego*) and agrees in the other cases (*czymś innym*). Under negation
  // the object is genitive: *nie widzi niczego* (the accusative *nic* is colloquial there).
  SOMETHING: {
    base: 'coś', person: '3', number: 'singular', gender: 'neut', thing: '1',
    ...cases('', 'czegoś, czemuś, coś, czymś, czymś'),
    negative: 'nic', ...cases('negative_', 'niczego, niczemu, nic, niczym, niczym'),
    with_other: 'coś innego', ...cases('with_other_', 'czegoś innego, czemuś innemu, coś innego, czymś innym, czymś innym'),
    negative_with_other: 'nic innego',
    ...cases('negative_with_other_', 'niczego innego, niczemu innemu, nic innego, niczym innym, niczym innym'),
  },
  EVERYTHING: {
    base: 'wszystko', person: '3', number: 'singular', gender: 'neut', thing: '1',
    ...cases('', 'wszystkiego, wszystkiemu, wszystko, wszystkim, wszystkim'),
    with_other: 'wszystko inne', ...cases('with_other_', 'wszystkiego innego, wszystkiemu innemu, wszystko inne, wszystkim innym, wszystkim innym'),
  },
  SOMEONE: {
    base: 'ktoś', person: '3', number: 'singular', gender: 'masc',
    ...cases('', 'kogoś, komuś, kogoś, kimś, kimś'),
    negative: 'nikt', ...cases('negative_', 'nikogo, nikomu, nikogo, nikim, nikim'),
  },
};
