/** Place an object clitic before a finite verb, after a leading "no " in the negative ("no me ve").
 *  Spanish object clitics do not elide. A no-op when there is no clitic. */
export function esCliticize(clitic: string, verb: string): string {
  if (!clitic) return verb;
  return verb.startsWith('no ') ? `no ${clitic} ${verb.slice(3)}` : `${clitic} ${verb}`;
}
