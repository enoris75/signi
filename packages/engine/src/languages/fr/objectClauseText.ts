import type { ResolvedPhrase } from '../../types.js';
import { indirectQuestionWord } from './indirectQuestionWord.js';
import { subordinateText } from './subordinateText.js';

/**
 * A French object clause behind the word that opens it, given the clause as `renderClause` wrote it
 * (P09-E4, P09-E17). A statement opens on "que" ("dit que le chat court", "qu'il court"). An indirect
 * yes/no question opens on "si", which elides before *il* and *ils* only — "demande s'il court", but
 * "si elle court", "si on court". An indirect wh-question opens on its word, with the statement's
 * order and no "est-ce que" — "demande ce que le chat mange", "ce qu'il mange", "où le chat mange" —
 * except over the subject, or a possessor inside it, whose word the clause already wrote in its
 * subject slot ("ce qui mange", "le chat de qui mange", P09-E14).
 */
export function objectClauseText(clause: ResolvedPhrase, text: string): string {
  if (!clause.embedded) return subordinateText('que', text);
  const gap = clause.question;
  if (!gap) return /^ils?\b/.test(text) ? `s'${text}` : `si ${text}`;
  if (gap.role === 'subject' || (gap.role === 'possessor' && gap.possessed === 'subject') || !clause.verbPhrase) return text;
  return subordinateText(indirectQuestionWord(gap, clause.verbPhrase.verb), text);
}
