import type { ResolvedPhrase } from '../../types.js';
import { objectComplementizer } from '../../functions/objectComplementizer.js';
import { questionWord } from './questionWord.js';

/**
 * What opens a German object clause, behind the comma (P09-E4, P09-E17): "dass" under a statement,
 * "ob" under an indirect yes/no question, and under an indirect wh-question its word — "fragt, was
 * der Kater frisst", "weiß, wo der Kater frisst" — the direct question's (`questionWord`), with no V2
 * to invert behind it: the clause stays verb-final. Over the subject the clause already wrote the
 * word in its subject slot ("fragt, wer das Essen isst"), so nothing leads it.
 */
export function objectClauseLead(clause: ResolvedPhrase): string {
  const lead = objectComplementizer(clause, 'dass', 'ob');
  const gap = clause.question;
  if (lead || !gap || gap.role === 'subject' || !clause.verbPhrase) return lead;
  return questionWord(gap, clause.verbPhrase.verb);
}
