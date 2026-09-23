import { estCeQue } from './estCeQue.js';

/**
 * A French wh-question over anything but the subject: the question word, then the statement behind
 * "est-ce que" exactly as the yes/no question writes it (`estCeQue`) — "où est-ce que le chat mange ?",
 * "pourquoi est-ce qu'il mange ?" (P09-E6). It is the everyday form, as "est-ce que" is for the
 * yes/no question; the inversion "que mange le chat ?" is the formal one, a follow-up. *que* elides
 * before the "est-ce" it now stands in front of: "qu'est-ce que le chat mange ?".
 */
export function frontQuestion(word: string, statement: string): string {
  const asked = estCeQue(statement);
  return word === 'que' ? `qu'${asked}` : `${word} ${asked}`;
}
