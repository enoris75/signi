/** Place an object clitic before a finite verb (Brazilian proclisis), after a leading "não " in the
 *  negative ("não me vê"). Portuguese object clitics do not elide here. A no-op with no clitic. */
export function ptCliticize(clitic: string, verb: string): string {
  if (!clitic) return verb;
  return verb.startsWith('não ') ? `não ${clitic} ${verb.slice(4)}` : `${clitic} ${verb}`;
}
