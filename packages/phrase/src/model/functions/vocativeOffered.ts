import { imperativeRegisterOf, type PhraseSelection } from "../interfaces.ts";

/**
 * Whether a period says its vocative (P11-E8, D4) — the one gate the canvas's border toggle, the plan
 * and the console's completion share. The engine reads the top clause's address alone, so a period
 * some link targets says none (`root` false); nor does a citation, which is said to no one ("Mom, to
 * run." reads wrong in all seven), nor an instruction, which addresses nobody and which the engine
 * refuses an address (A338). A statement, a question, a verbless period and a command in the
 * `request` register say it.
 *
 * Where it is withdrawn, a vocative already built stays in the selection and the printed line, its
 * box dimmed; only the plan leaves it out.
 */
export function vocativeOffered(selection: PhraseSelection, root: boolean): boolean {
  if (!root || selection.infinitive) return false;
  return !(selection.imperative && imperativeRegisterOf(selection) === "instruction");
}
