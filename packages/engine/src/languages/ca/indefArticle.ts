/** The indefinite article: *un / una*, and in the plural *uns / unes* (P03 §2.1). It never elides. */
export function indefArticle(forms: Record<string, string>, plural = false): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  if (plural) return fem ? 'unes' : 'uns';
  return fem ? 'una' : 'un';
}
