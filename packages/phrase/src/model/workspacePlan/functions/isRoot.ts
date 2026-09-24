import type { PhraseContainer, PhraseLink } from "../../interfaces.ts";

// A container is a root iff no link targets it — those translate as their own sentence.
export function isRoot(container: PhraseContainer, links: PhraseLink[]): boolean {
  return !links.some((l) => l.target.containerId === container.id);
}
