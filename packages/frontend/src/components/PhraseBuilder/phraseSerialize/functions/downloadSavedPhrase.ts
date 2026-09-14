import type { SavedPhrase } from "@signi/shared";
import { slugify } from "./slugify.ts";

/** Trigger a browser download of a SavedPhrase as a pretty-printed `.json` file. */
export function downloadSavedPhrase(doc: SavedPhrase): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(doc.name ?? "phrase")}.signi.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
