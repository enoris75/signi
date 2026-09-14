import type { ResolvedNounPhrase } from '../types.js';
import { firstConjunct } from './firstConjunct.js';
import { objectPreposition } from './objectPreposition.js';
import { relativeGapComplement } from './relativeGapComplement.js';

/**
 * The relativizer stand-in for a relative clause whose head is the object of a verb that takes its
 * object with a preposition, with that preposition, or `undefined` for any other head (A139). The
 * head fills the direct object, but the preposition makes the gap a prepositional one: Italian "il
 * pulsante sul quale il gatto clicca", French "le bouton sur lequel le chat clique", German "die
 * Taste, auf die der Kater klickt", never "che" / "que" / "die". The stand-in is the one
 * `relativeGapComplement` builds from `forms` (A62), as `relativeAlarmHead` builds the alarm's (A129).
 */
export function relativePrepositionalHead(
  np: ResolvedNounPhrase,
  forms: Record<string, string>,
): { prep: string; head: ResolvedNounPhrase } | undefined {
  const rel = np.relative;
  const prep = rel?.headRole === 'directObject' ? objectPreposition(rel.verbPhrase.verb) : '';
  if (!rel || !prep) return undefined;
  const gap = relativeGapComplement({ ...np, relative: { ...rel, headRole: 'terminus' } }, forms);
  const head = gap?.['terminus'] && firstConjunct(gap['terminus'].phrase);
  return head ? { prep, head } : undefined;
}
