/**
 * *negin* (no), agreeing in gender: *negin*, *negina* (the column's SOMEONE says *negin*, verify).
 * Singular, but for a plurale tantum, which has no singular to take it: *negins*, *neginas*.
 */
export function neginForm(gender: string, plural = false): string {
  const fem = gender === 'fem';
  if (plural) return fem ? 'neginas' : 'negins';
  return fem ? 'negina' : 'negin';
}
