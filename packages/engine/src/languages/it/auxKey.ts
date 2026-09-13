/** Person/number key ("1sg" … "3pl") into the auxiliary conjugation tables (`STARE_IT`, `ESSERE_IT`, `AVERE_IT`). */
export function auxKey(subjectForms: Record<string, string>): string {
  const person = subjectForms['person'] ?? '3';
  const n = (subjectForms['number'] ?? 'singular') === 'plural' ? 'pl' : 'sg';
  return `${person}${n}`;
}
