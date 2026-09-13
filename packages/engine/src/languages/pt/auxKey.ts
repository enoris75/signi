/** Person/number key ("1sg" … "3pl") into the "estar" auxiliary table (`ESTAR_PT`). */
export function auxKey(subjectForms: Record<string, string>): string {
  const person = subjectForms['person'] ?? '3';
  const n = (subjectForms['number'] ?? 'singular') === 'plural' ? 'pl' : 'sg';
  return `${person}${n}`;
}
