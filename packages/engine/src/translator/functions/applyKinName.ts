import type { NounPhrase } from '@signi/shared';

/**
 * A casual kin term **used as a name** — "**Mom** runs", *Maman court*, *Mama läuft*, *Mamá corre*,
 * *Mamãe corre* (P11-E3 D1). The lexeme says it can be one (`as_name: '1'`), and the phrase says it
 * is one: definite, singular, and nothing that makes it *a* mother rather than *the* one the speaker
 * means — no possessor, no adjective, no noun modifier, no relative clause, no numeral, no title. An
 * indefinite or possessed one stays the common noun it is ("a mom", "my mom").
 *
 * It is then a personal name like PETER (C38): `proper`, so every article builder writes the article
 * the language gives a person's name — none in English, German and Spanish, and none in French and
 * Portuguese either, whose lexemes say so with PETER's own `takes_article: '0'` — and every slot a
 * name fills agrees: an object ("ve **a** Mamá"), a preposition ("à Papa"), a genitive ("Mom's
 * book", *das Buch Mamas*). The word is capitalized where the language capitalizes a name.
 *
 * The flag is a fact about one language's word, not about the concept: Italian keeps its article in
 * the third person, *la mamma corre*, and so does not set it. Japanese sets it and changes nothing,
 * because MOM's one word, お母さん, is already the honorific a name takes.
 *
 * The common noun's word is kept in `name_of` for the one reader that has to take the name back, a
 * possessor question ("whose mom runs?", see `withQuestionPossessor`). Runs on the head's own forms,
 * before the determiner is picked.
 */
export function applyKinName(np: NounPhrase, forms: Record<string, string>): void {
  if (forms['as_name'] !== '1') return;
  const plain = (np.definiteness ?? 'definite') === 'definite'
    && (np.number ?? 'singular') === 'singular'
    && !np.possessor
    && !np.adjectives?.length
    && !np.nounModifiers?.length
    && !np.relative
    && np.numeral === undefined
    && !np.title;
  if (!plain) return;
  const base = forms['base'] ?? '';
  forms['proper'] = '1';
  forms['name_of'] = base;
  forms['base'] = base.charAt(0).toLocaleUpperCase() + base.slice(1);
}
