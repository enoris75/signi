/**
 * The enclitic shape of each weak pronoun (P03 §2.2): its full form after a consonant or a diphthong in
 * *-u* ("menjar-lo", "mengeu-lo", "tornar-se"), its reduced form after any other vowel ("menja'l",
 * "torna't", "beure's"). Keyed by the proclitic the column stores.
 */
const ENCLITIC: Record<string, [string, string]> = {
  em: ['-me', "'m"], et: ['-te', "'t"], es: ['-se', "'s"], ens: ['-nos', "'ns"], us: ['-vos', '-us'],
  el: ['-lo', "'l"], la: ['-la', '-la'], els: ['-los', "'ls"], les: ['-les', '-les'],
  li: ['-li', '-li'], ho: ['-ho', '-ho'], hi: ['-hi', '-hi'],
};

/**
 * Attach a weak pronoun — or a cluster, `caCliticCluster`'s proclitic spelling — after an infinitive,
 * a gerund or an affirmative command: "menjar-lo", "menja'l", "mengem-lo", "tornar-se", "torna't",
 * "tornant-se". A cluster attaches whole, its first pronoun in the full form and its words hyphenated:
 * "donar-me'l", "dona-l'hi". A no-op with no clitic. *(verify)* for every cluster.
 */
export function caEnclitic(verb: string, clitic: string): string {
  if (!clitic || !verb) return verb;
  const afterVowel = /[aeiouàèéíòóúï]$/i.test(verb) && !/[aeiou]u$/i.test(verb);
  const single = ENCLITIC[clitic];
  if (single) return `${verb}${afterVowel ? single[1] : single[0]}`;
  // A cluster: its first word in its full enclitic form, the rest joined by hyphens.
  const [first, ...rest] = clitic.split(' ');
  const lead = first!.replace(/^ens$/, 'nos').replace(/^us$/, 'vos');
  return `${verb}-${[lead, ...rest].join('-')}`;
}
