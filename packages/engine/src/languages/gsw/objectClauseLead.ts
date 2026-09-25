import type { ResolvedPhrase } from '../../types.js';
import { objectComplementizer } from '../../functions/objectComplementizer.js';
import { questionFront } from './questionFront.js';

/**
 * What opens a German object clause, behind the comma (P09-E4, P09-E17), and the clause left behind
 * it: "dass" under a statement, "ob" under an indirect yes/no question, and under an indirect
 * wh-question what the direct question fronts (`questionFront`) — "fragt, was der Kater frisst",
 * "weiß, wo der Kater frisst", "fragt, wessen Essen der Kater frisst" (P09-E14, the object slot left
 * empty) — with no V2 to invert behind it: the clause stays verb-final. Over the subject, or a
 * possessor inside it, the clause already wrote the word in its subject slot ("fragt, wer das Essen
 * isst", "fragt, wessen Kater das Essen frisst"), so nothing leads it.
 */
export function objectClauseLead(clause: ResolvedPhrase): { lead: string; rest: ResolvedPhrase } {
  const lead = objectComplementizer(clause, 'das', 'öb');
  const gap = clause.question;
  const subjectAsked = gap?.role === 'subject' || (gap?.role === 'possessor' && gap.possessed === 'subject');
  if (lead || !gap || subjectAsked || !clause.verbPhrase) return { lead, rest: clause };
  const { word, rest } = questionFront(clause);
  return { lead: word, rest };
}
