/**
 * Subject–auxiliary inversion, the order of an English yes/no question: the finite auxiliary leads and
 * the subject follows it — "**is** the server active?", "**has** the cat eaten?", "**does** the cat not
 * eat?". `parts` is the predicate as `predicateParts` builds it for a question, whose first non-empty
 * part opens on that auxiliary: a group with none of its own is given *do*-support there.
 *
 * "cannot" is one written word for two, and only the "can" moves: "can the cat not run?".
 */
export function invertSubject(subject: string, parts: string[]): string[] {
  const at = parts.findIndex(Boolean);
  if (at < 0 || !subject) return [subject, ...parts];
  const [first, ...rest] = parts[at].split(' ');
  const [aux, ...afterAux] = first === 'cannot' ? ['can', 'not'] : [first];
  return [aux, subject, [...afterAux, ...rest].join(' '), ...parts.slice(at + 1)];
}
