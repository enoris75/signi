import type { VerbGroup } from './verbGroup.js';
import { withClitic } from './reflexiveClitic.js';
import { adBeforeVowel } from './adBeforeVowel.js';

/**
 * A verb group with a reflexive verb's clitic in place: before the finite verb of a simple tense ("el
 * as ferma"), before the **auxiliary** of the compound past ("el s'es fermà", as Italian's *si è
 * fermato*; the author's draft, verify), and on the infinitive after the future, an aspect frame or a
 * modal ("el vain ad as fermar", "eu vögl am fermar"). The infinitive is the group's last word.
 */
export function withReflexive(group: VerbGroup, clitic: string): VerbGroup {
  if (!clitic) return group;
  if (group.rest.length === 0 || group.perfect) return { ...group, finite: withClitic(clitic, group.finite) };
  const rest = [...group.rest];
  const last = rest.length - 1;
  rest[last] = withClitic(clitic, rest[last]!);
  // The future's *a* is chosen by the word after it, which the clitic now is: "vain ad as tschantar".
  if (last > 0 && (rest[last - 1] === 'a' || rest[last - 1] === 'ad')) rest[last - 1] = adBeforeVowel('a', rest[last]!);
  return { ...group, rest };
}
