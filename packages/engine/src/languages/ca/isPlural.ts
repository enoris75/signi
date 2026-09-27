/** Whether a noun phrase surfaces as plural. A `no`-determined phrase is singular — "cap gat", never
 *  "*cap gats" (NO_TAKES_SINGULAR) — unless the noun has no singular: "cap notícies" is not built,
 *  a plurale tantum keeps its plural ("els diners"). */
export function isPlural(forms: Record<string, string>): boolean {
  if (forms['definiteness'] === 'no') return forms['count'] === 'plural';
  return (forms['number'] ?? forms['count']) === 'plural';
}
