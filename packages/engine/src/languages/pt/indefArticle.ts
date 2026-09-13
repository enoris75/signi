/** The indefinite article: um/uma (singular), uns/umas (plural). */
export function indefArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return gender === 'fem' ? 'umas' : 'uns';
  return gender === 'fem' ? 'uma' : 'um';
}
