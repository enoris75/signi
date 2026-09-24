/** Whether a noun phrase surfaces as plural. A `no`-determined phrase is always singular in
 *  Portuguese — the negative quantifier "nenhum" has no plural — so a requested plural is ignored
 *  ("nenhum rato", never the mismatched "nenhum ratos"). */
export function isPlural(forms: Record<string, string>): boolean {
  // A plurale tantum has no singular to fall back on, and takes the plural quantifier: "nenhumas notícias".
  if (forms['definiteness'] === 'no') return forms['count'] === 'plural';
  return (forms['number'] ?? forms['count']) === 'plural';
}
