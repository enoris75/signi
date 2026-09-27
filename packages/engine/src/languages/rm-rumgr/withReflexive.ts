import type { VerbGroup } from './verbGroup.js';
import { withClitic } from './reflexiveClitic.js';

/**
 * A verb group with a reflexive verb's clitic before the **lexical** verb, wherever that stands: the
 * finite verb of a simple tense ("el sa tschenta"), the participle of the compound past ("el è sa
 * tschentà"), the infinitive after the future, an aspect frame or a modal ("el vegn a sa tschentar",
 * "jau vi ma tschentar"). RG keeps the clitic with the verb it belongs to rather than climbing to the
 * auxiliary (P04-E10, verify). The lexical verb is the group's last word.
 */
export function withReflexive(group: VerbGroup, clitic: string): VerbGroup {
  if (!clitic) return group;
  if (group.rest.length === 0) return { ...group, finite: withClitic(clitic, group.finite) };
  const rest = [...group.rest];
  rest[rest.length - 1] = withClitic(clitic, rest[rest.length - 1]!);
  return { ...group, rest };
}
