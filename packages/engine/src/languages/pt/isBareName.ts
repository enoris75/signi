/**
 * A proper noun Portuguese names without an article: "Portugal", "de Portugal", "em Portugal", where
 * every other name takes its definite article ("a Itália", "da Itália", "no Japão"). The name's forms
 * mark it with `takes_article: '0'` (localization B36). German and Spanish read the same key the other
 * way round, `'1'` on the few names they do article, because their proper nouns go bare by default.
 */
export function isBareName(forms: Record<string, string>): boolean {
  return forms['proper'] === '1' && forms['takes_article'] === '0';
}
