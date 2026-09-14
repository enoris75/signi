import type { SavedPhrase, SavedPhraseKind } from "@signi/shared";
import { SAVED_PHRASE_FORMAT, SAVED_PHRASE_VERSION } from "@signi/shared";

/**
 * Parse and validate an imported JSON document, returning its workspace. Throws a
 * user-readable Error if the file isn't a saved phrase or is from a newer schema
 * version this build can't read.
 */
export function parseSavedPhrase(raw: unknown): SavedPhrase {
  if (!raw || typeof raw !== "object") throw new Error("Not a valid phrase file.");
  const doc = raw as Partial<SavedPhrase>;
  if (doc.format !== SAVED_PHRASE_FORMAT) {
    throw new Error("This file is not a Signi phrase file.");
  }
  if (typeof doc.version !== "number") throw new Error("Phrase file is missing a version.");
  if (doc.version > SAVED_PHRASE_VERSION) {
    throw new Error(
      `This phrase was saved by a newer version of Signi (v${doc.version}); please update.`,
    );
  }
  if (!doc.workspace || !Array.isArray(doc.workspace.containers)) {
    throw new Error("Phrase file has no workspace data.");
  }
  // `kind` was added after v1 files first shipped; treat a missing value as a full phrase.
  const kind: SavedPhraseKind = doc.kind === "period" ? "period" : "phrase";
  return { ...(doc as SavedPhrase), kind };
}
