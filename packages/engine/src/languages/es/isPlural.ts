/** Whether a noun phrase surfaces as plural. A `no`-determined phrase is always singular in Spanish
 *  — the negative quantifier "ninguno" has no plural — so a requested plural is ignored ("ningún
 *  ratón", never the mismatched "ningún ratones"). */
export function isPlural(forms: Record<string, string>): boolean {
  // A plurale tantum has no singular to fall back on, and takes the plural quantifier: "ningunas noticias".
  if (forms['definiteness'] === 'no') return forms['count'] === 'plural';
  return (forms['number'] ?? forms['count']) === 'plural';
}
