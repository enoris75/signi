const REDUCED: Record<string, string> = { el: "'l", els: "'ls", em: "'m", et: "'t", ens: "'ns" };

/**
 * Two weak pronouns written as one proclitic cluster (P03 §2.2; the full system is out of scope, this
 * covers the pairs the engine builds — the impersonal *es* before an object, a dative before an
 * accusative):
 *
 * - *em, et, es* take their full form *me, te, se* before another pronoun, which reduces where it can:
 *   "se'l menja", "me'l dona", "se'ns", "se li", "se us"; before *ho, hi* the first elides: "s'ho",
 *   "m'ho", "s'hi";
 * - the dative *li* before a third-person accusative is *hi* behind it: "l'hi dona", "la hi dona", "els
 *   hi dona", "les hi dona"; before *ho* it stays: "li ho dona";
 * - any other pair is two words: "ens el dona", "us la dona", "els ho dona".
 *
 * Either pronoun alone is returned as it is. *(verify)*.
 */
export function caCliticCluster(first: string, second: string): string {
  if (!first || !second) return first || second;
  if (first === 'em' || first === 'et' || first === 'es') {
    const c = first[1]!;
    if (second === 'ho' || second === 'hi') return `${c}'${second}`;
    const reduced = REDUCED[second];
    return reduced ? `${c}e${reduced}` : `${c}e ${second}`;
  }
  if (first === 'li') {
    if (second === 'el') return "l'hi";
    if (second === 'la' || second === 'els' || second === 'les') return `${second} hi`;
  }
  return `${first} ${second}`;
}

/** A list of weak pronouns, in order, as one cluster: a pair through `caCliticCluster`, more side by side. */
export function clusterAll(clitics: string[]): string {
  const present = clitics.filter(Boolean);
  return present.length === 2 ? caCliticCluster(present[0]!, present[1]!) : present.join(' ');
}
