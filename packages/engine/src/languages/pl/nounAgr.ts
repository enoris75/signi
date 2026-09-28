import type { Agr, Gender } from './pl.types.js';

/**
 * What a word agreeing with this head reads (P05 §2.1): its gender and number, whether a plural is
 * masculine-personal, and whether a masculine singular takes the animate accusative. A plurale tantum
 * (*pieniądze, plecy*) agrees as a non-virile plural whatever number the plan asked for (style-pl.md).
 * A masculine personal noun in *-a* (*mężczyzna*) is `virile` without `animate_acc` — its own accusative
 * is *mężczyznę* — but its adjective still takes the animate accusative (*dobrego mężczyznę*). A
 * masculine plural personal pronoun is virile (*oni*), and a masculine pronoun animate (*kogoś dużego*).
 */
export function nounAgr(forms: Record<string, string>): Agr {
  const pluraleTantum = forms['plurale_tantum'] === '1';
  const plural = pluraleTantum || forms['number'] === 'plural';
  const g = forms['gender'];
  const gender: Gender = g === 'fem' || g === 'neut' ? g : 'masc';
  const masc = gender === 'masc';
  const pronoun = !!forms['person'] && forms['thing'] !== '1';
  return {
    gender,
    plural,
    virile: plural && masc && !pluraleTantum && (forms['virile'] === '1' || pronoun),
    animate: masc && (forms['animate_acc'] === '1' || forms['virile'] === '1' || pronoun),
  };
}
