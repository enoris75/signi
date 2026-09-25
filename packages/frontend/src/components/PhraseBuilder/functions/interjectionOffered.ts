import { vocativeOffered } from "@signi/phrase/model/functions/vocativeOffered.ts";
import type { PhraseSelection, WorkspaceBinding } from "../interfaces.ts";

/**
 * Whether some link targets this period — a relative clause, an if-clause, a coordinate, a subordinate
 * clause, an instrument — so that it is no root, and says neither the top clause's interjection nor its
 * vocative. A standalone period is always a root.
 */
export function periodIsLinkTarget(binding: WorkspaceBinding | undefined): boolean {
  if (!binding) return false;
  return (
    binding.relative.targetKeys.size > 0 ||
    binding.conditional.hasTarget ||
    binding.coordinative.hasTarget ||
    Boolean(binding.subordinate.asTarget) ||
    binding.instrumental.hasTarget
  );
}

/**
 * Whether a period offers the interjection's border toggle (P09-E47, D2). The engine speaks the top
 * clause's interjection alone, so a period some link targets offers none; nor does a citation, which
 * calls no one ("Hey, to run." reads wrong in all seven).
 */
export function interjectionOffered(selection: PhraseSelection, binding: WorkspaceBinding | undefined): boolean {
  if (selection.infinitive) return false;
  return !periodIsLinkTarget(binding);
}

/**
 * Whether a period offers the vocative's border toggle (P11-E8, D4): a root period that says its
 * address — not a citation, not an instruction (see vocativeOffered, which the plan asks too).
 */
export function vocativeOfferedOn(selection: PhraseSelection, binding: WorkspaceBinding | undefined): boolean {
  return vocativeOffered(selection, !periodIsLinkTarget(binding));
}
