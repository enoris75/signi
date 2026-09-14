import type { SerializedWorkspace } from "@signi/shared";
import type { PhraseContainer } from "../../interfaces.ts";
import { serializeWorkspace } from "./serializeWorkspace.ts";

/**
 * Serialize a single clause (one container) as a `period` workspace — one container, no
 * cross-container links. Nested possessors travel inside the selection; subordinate clauses
 * (which live in *other* containers) are deliberately not included.
 */
export function serializePeriod(container: PhraseContainer): SerializedWorkspace {
  return serializeWorkspace([container], []);
}
