/**
 * *ingün* (no), agreeing in gender: *ingün*, *ingüna* (the style sheet's leak list, verify). Singular,
 * but for a plurale tantum, which has no singular to take it: *ingüns*, *ingünas*.
 */
export function ingunForm(gender: string, plural = false): string {
  const fem = gender === 'fem';
  if (plural) return fem ? 'ingünas' : 'ingüns';
  return fem ? 'ingüna' : 'ingün';
}
