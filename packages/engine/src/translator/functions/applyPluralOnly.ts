/**
 * A **plurale tantum** — a lexeme plural in every use (*le notizie*, *die Nachrichten*, P09-E41) —
 * marks itself `count: 'plural'` and seeds its one surface as `base`, with no `plural` beside it.
 * Settle it before the phrase's number is: the surface becomes the plural as well, so every engine's
 * plural lookup finds it, and a mass flag the concept carries for another language's sake (English
 * *news* is mass) is dropped, since a plural-only noun counts (*tre notizie*). Returns whether the
 * lexeme is plural-only, which then wins over any number the plan picked (D2).
 */
export function applyPluralOnly(forms: Record<string, string>): boolean {
  if (forms['count'] !== 'plural') return false;
  forms['plural'] ??= forms['base'] ?? '';
  delete forms['uncountable'];
  return true;
}
