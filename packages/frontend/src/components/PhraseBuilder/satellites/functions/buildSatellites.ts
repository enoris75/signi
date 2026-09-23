import type { LanguageCode } from "@signi/shared";
import type { UiStringLookup } from "../../../../i18n/conceptWord.ts";
import type { PhraseSelection } from "../../interfaces.ts";
import type { BuiltSatellites } from "../satellites.types.tsx";
import { rawSatellites } from "./rawSatellites.tsx";
import { resolveSatellites } from "./resolveSatellites.ts";

// Derive every satellite for the current selection, resolving each one's `shown`
// state (an explicit reveal toggle wins; otherwise a set satellite auto-expands).
export function buildSatellites(
  selection: PhraseSelection,
  revealed: Record<string, boolean>,
  language: LanguageCode,
  t: UiStringLookup,
  // The period governs a that-clause, its verb's object (P09-E12 D9) — see rawSatellites.
  clauseObject = false,
): BuiltSatellites {
  return resolveSatellites(rawSatellites(selection, language, t, clauseObject), {
    revealed,
    // A command or an infinitive citation takes the subject's place on the canvas.
    subjectDropped: Boolean(selection.imperative || selection.infinitive),
  });
}
