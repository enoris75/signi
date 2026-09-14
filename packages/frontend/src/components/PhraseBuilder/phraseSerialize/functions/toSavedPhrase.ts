import type { SavedPhrase } from "@signi/shared";
import { SAVED_PHRASE_FORMAT, SAVED_PHRASE_VERSION } from "@signi/shared";
import type { PhraseContainer, PhraseLink } from "../../interfaces.ts";
import { serializeWorkspace } from "./serializeWorkspace.ts";

/** Wrap a whole workspace as a versioned `phrase` document (the export-file / DB body). */
export function toSavedPhrase(
  name: string,
  containers: PhraseContainer[],
  links: PhraseLink[],
): SavedPhrase {
  return {
    format: SAVED_PHRASE_FORMAT,
    version: SAVED_PHRASE_VERSION,
    kind: "phrase",
    savedAt: new Date().toISOString(),
    name,
    workspace: serializeWorkspace(containers, links),
  };
}
