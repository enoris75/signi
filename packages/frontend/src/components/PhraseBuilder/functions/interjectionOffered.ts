import type { PhraseSelection, WorkspaceBinding } from "../interfaces.ts";

/**
 * Whether a period offers the interjection's border toggle (P09-E47, D2). The engine speaks the top
 * clause's interjection alone, so a period some link targets — a relative clause, an if-clause, a
 * coordinate, a subordinate clause, an instrument — offers none; nor does a citation, which calls no
 * one ("Hey, to run." reads wrong in all seven). A standalone period is always a root.
 */
export function interjectionOffered(selection: PhraseSelection, binding: WorkspaceBinding | undefined): boolean {
  if (selection.infinitive) return false;
  if (!binding) return true;
  return !(
    binding.relative.targetKeys.size > 0 ||
    binding.conditional.hasTarget ||
    binding.coordinative.hasTarget ||
    Boolean(binding.subordinate.asTarget) ||
    binding.instrumental.hasTarget
  );
}
