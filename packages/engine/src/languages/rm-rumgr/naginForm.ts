/**
 * *nagin* (no), agreeing in gender: *nagin*, *nagina* (P04 §2.1, verify). Singular, but for a plurale
 * tantum, which has no singular to take it: *nagins*, *naginas*.
 */
export function naginForm(gender: string, plural = false): string {
  const fem = gender === 'fem';
  if (plural) return fem ? 'naginas' : 'nagins';
  return fem ? 'nagina' : 'nagin';
}
