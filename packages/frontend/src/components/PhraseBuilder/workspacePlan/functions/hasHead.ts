import type { NounElement } from "@signi/shared";

// Whether a noun element has a word to say: its own head, or a coordinated group's first conjunct.
// A clause whose subject has none is not a clause yet: the builder folds it in nowhere until it has
// (see attachSubordinate, attachCondition, attachCoordination, buildRelativeClause).
export function hasHead(subject: NounElement | undefined): boolean {
  const el = subject as { concept?: string; conjuncts?: { concept?: string }[] } | undefined;
  return Boolean(el?.conjuncts?.[0]?.concept ?? el?.concept);
}
