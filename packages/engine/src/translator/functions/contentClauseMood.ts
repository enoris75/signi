import type { Mood } from '../../types.js';
import { CONTENT_CLAUSE_MOOD } from '../translator.consts.js';

/**
 * The mood a content clause is resolved in, read off its **governor** — the predicate adjective of a
 * clausal subject, the verb of a clausal object (P09-E4, D1). Mood is a property of the word that
 * governs the clause, not of the construction: *dire* asserts, so "dice che il gatto **corre**";
 * *giusto* judges, so "è giusto che si **agisca**". Put the wrong mood on SAY and every Romance
 * rendering is wrong, which is why it is not a flat per-language rule any more.
 *
 * The lexeme names it as `content_clause_mood` — `'subjunctive'` or `'indicative'` — in the forms of
 * the languages that distinguish them, exactly as `object_predicative_link` names a verb's link: a
 * fact about the word, carried on the lexeme. `'subjunctive'` is this language's present subjunctive
 * (`CONTENT_CLAUSE_MOOD`), and nothing where it has none.
 *
 * What a governor that declares nothing gets depends on the host. An object clause takes the
 * indicative an assertion takes. A subject clause falls back on `CONTENT_CLAUSE_MOOD`, the rule C30
 * shipped: only evaluative predicates host one, and what they are said of is judged.
 *
 * Under a **negated** governor the lexeme may name another mood, `content_clause_mood_negative`
 * (A247): negating a verb of belief denies the proposition, and French, Spanish and Portuguese put
 * the denied one in the subjunctive — "ne croit pas que le chat **coure**", "no cree que el gato
 * **corra**" — where the affirmative asserts it in the indicative. It is keyed on the word, not the
 * language: a negated SAY still reports in the indicative ("no dice que corre"), so a governor that
 * names no negative mood keeps the one it takes affirmed.
 */
export function contentClauseMood(
  governor: Record<string, string> | undefined,
  language: string,
  host: 'subject' | 'object',
  negative = false,
): Mood | undefined {
  const declared = (negative ? governor?.['content_clause_mood_negative'] : undefined)
    ?? governor?.['content_clause_mood'];
  if (declared === 'subjunctive') return CONTENT_CLAUSE_MOOD[language];
  if (declared === 'indicative') return undefined;
  return host === 'subject' ? CONTENT_CLAUSE_MOOD[language] : undefined;
}
