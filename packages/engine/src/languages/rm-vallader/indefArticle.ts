/**
 * The indefinite article (the style sheet): *ün* (m), *üna* (f), never elided (verify); none in the
 * plural ("giats").
 */
export function indefArticle(forms: Record<string, string>, plural: boolean): string {
  if (plural) return '';
  return (forms['gender'] ?? 'masc') === 'fem' ? 'üna' : 'ün';
}
