/**
 * Place a proclitic (or a cluster) before a finite verb group, after a leading "no " in the negative:
 * "el menja", "no el menja", "el va menjar". Its elision before a vowel ("l'estima", "s'ha tornat") is
 * `caSurface`'s. A no-op when there is no clitic.
 */
export function caCliticize(clitic: string, verb: string): string {
  if (!clitic) return verb;
  return verb.startsWith('no ') ? `no ${clitic} ${verb.slice(3)}` : `${clitic} ${verb}`;
}
