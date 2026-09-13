/** Whether a noun phrase surfaces as plural. A `no`-determined phrase is always singular in Spanish
 *  — the negative quantifier "ninguno" has no plural — so a requested plural is ignored ("ningún
 *  ratón", never the mismatched "ningún ratones"). */
export function isPlural(forms: Record<string, string>): boolean {
  return (forms['number'] ?? forms['count']) === 'plural' && forms['definiteness'] !== 'no';
}
