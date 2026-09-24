import type { ConceptForms } from '../types.js';

/**
 * A main statement with its sentence adverb at the head (P09-E39): "maybe the cat did not eat",
 * *forse il gatto non mangiò*. The lexeme names how the adverb joins the clause, where the language
 * wants more than a space (`fronted`):
 * - `que` — a complementizer, which French *peut-être* and Portuguese *claro* take once fronted:
 *   *peut-être que le chat…*, *claro que o gato…*. `elide` writes it where the language elides
 *   ("peut-être qu'il…").
 * - `comma` — the comma a fronted discourse adverb is set off by: "actually, the cat…", *en fait, le
 *   chat…*.
 */
export function withSentenceAdverb(
  adverb: ConceptForms,
  clause: string,
  elide: (clause: string) => string = (c) => `que ${c}`,
): string {
  const word = adverb.forms['base'] ?? '';
  switch (adverb.forms['fronted']) {
    case 'que': return `${word} ${elide(clause)}`;
    case 'comma': return `${word}, ${clause}`;
    default: return `${word} ${clause}`;
  }
}
