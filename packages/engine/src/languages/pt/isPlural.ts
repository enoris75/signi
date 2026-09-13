/** Whether a noun phrase surfaces as plural. A `no`-determined phrase is always singular in
 *  Portuguese — the negative quantifier "nenhum" has no plural — so a requested plural is ignored
 *  ("nenhum rato", never the mismatched "nenhum ratos"). */
export function isPlural(forms: Record<string, string>): boolean {
  return (forms['number'] ?? forms['count']) === 'plural' && forms['definiteness'] !== 'no';
}
