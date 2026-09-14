import type { SavedPhrase } from "@signi/shared";
import { parseSavedPhrase } from "./parseSavedPhrase.ts";

/** Read and validate a user-picked file as a SavedPhrase (throws on bad content). */
export async function readSavedPhraseFile(file: File): Promise<SavedPhrase> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  return parseSavedPhrase(parsed);
}
