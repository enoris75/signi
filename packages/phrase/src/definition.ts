import type { Concept, GrammaticalRole, PhrasePlan } from "@signi/shared";
import { applyScript } from "./language/apply.ts";
import { printWorkspace } from "./language/print.ts";
import type { Vocabulary, WorkspaceState } from "./language/types.ts";
import { planToWorkspace, workspaceToPlans } from "./model/workspacePlan/index.ts";

/**
 * The vocabulary a seed's definition is written in (P13): every concept, named by its id. The
 * console resolves an id before any label (`resolveWord`), and a word printed with this vocabulary
 * is its id, so a definition says `OBJECT_THING` — which no homonym seeded later can take over.
 */
export function definitionVocabulary(concepts: readonly Concept[]): Vocabulary {
  const byRole: Partial<Record<GrammaticalRole, Concept[]>> = {};
  for (const c of concepts) (byRole[c.role] ??= []).push(c);
  return { concepts: byRole, language: "en", label: (c) => c.id };
}

/** Why a definition's text did not compile: the concept it defines, the line, and what went wrong. */
export class DefinitionError extends Error {
  constructor(
    readonly text: string,
    readonly reason: string,
  ) {
    super(`${reason}\n  in: ${text}`);
    this.name = "DefinitionError";
  }
}

/**
 * The plan a definition's text builds: the text applied to an empty workspace, as the console
 * applies a pasted script, and the workspace serialised as the canvas serialises it. A definition
 * is one period — its linked periods written inside it — so a text that leaves a second root, or
 * that the console refuses, throws a `DefinitionError` naming the diagnostic.
 */
export function compileDefinition(text: string, vocab: Vocabulary): PhrasePlan {
  const state = definitionWorkspace(text, vocab);
  const roots = workspaceToPlans(state.containers, state.links);
  if (roots.length !== 1) throw new DefinitionError(text, `a definition is one period, and this makes ${roots.length}`);
  return roots[0]!.plan as PhrasePlan;
}

/** The workspace a definition's text builds (see `compileDefinition`), for a caller that shows it. */
export function definitionWorkspace(text: string, vocab: Vocabulary): WorkspaceState {
  let n = 0;
  const result = applyScript({ containers: [{ id: "p1", selection: {} }], links: [] }, text, {
    context: { containerId: "p1" },
    vocab,
    newId: () => `d${++n}`,
  });
  if (result.diagnostic) throw new DefinitionError(text, result.diagnostic.message);
  return result.state;
}

/**
 * A plan as the text of a definition: the workspace it is (`planToWorkspace`) printed in the
 * definition vocabulary. `unsupported` names what of the plan the language cannot say yet, which
 * the text then leaves out.
 */
export function printDefinition(
  plan: PhrasePlan,
  vocab: Vocabulary,
): { text: string; unsupported: string[] } {
  const byId = new Map(Object.values(vocab.concepts).flat().map((c) => [c.id, c]));
  const { containers, links, unsupported } = planToWorkspace(plan, (id) => byId.get(id));
  return { text: printWorkspace({ containers, links }, vocab), unsupported };
}
