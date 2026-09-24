// The phrase model and its language (P13): the workspace the canvas edits, how it becomes a
// PhrasePlan, and the P02 console language that prints it as text and applies text back. Pure, so the
// backend can load it as well as the frontend. The frontend reaches the modules one by one (its old
// paths re-export them); what a consumer outside it needs is here.
export type { PhraseContainer, PhraseLink, PhraseSelection } from "./model/interfaces.ts";
export { selectionToPlan } from "./model/selectionToPlan/index.ts";
export { planToWorkspace, workspaceToPlans, type PlanWorkspace } from "./model/workspacePlan/index.ts";
export type { WorkspaceSentence } from "./model/workspacePlan/workspacePlan.types.ts";
export type { ConsoleContext, Vocabulary, WorkspaceState } from "./language/types.ts";
export { applyScript, type ApplyOptions, type ApplyResult } from "./language/apply.ts";
export { printPeriod, printWorkspace } from "./language/print.ts";
export { normalizeWorkspace, sameWorkspace } from "./language/normalize.ts";
export {
  compileDefinition,
  definitionVocabulary,
  definitionWorkspace,
  DefinitionError,
  printDefinition,
} from "./definition.ts";
