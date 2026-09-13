/**
 * The indefinite article: masc "un", fem "une", plural "des" (French keeps a plural
 * indefinite, unlike the Romance siblings). "un"/"une" don't elide before a vowel.
 */
export function indefArticle(forms: Record<string, string>, plural: boolean): string {
  if (plural) return 'des';
  return (forms['gender'] ?? 'masc') === 'fem' ? 'une' : 'un';
}
