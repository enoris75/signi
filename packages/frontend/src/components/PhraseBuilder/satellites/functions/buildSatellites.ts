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
  // What the selection alone cannot tell: whether a conditional, a coordination or a subordinate
  // link locks the period's mood, and whether it governs a that-clause (see rawSatellites).
  clause: Parameters<typeof rawSatellites>[3] = {},
): BuiltSatellites {
  return resolveSatellites(rawSatellites(selection, language, t, clause), {
    revealed,
    // A command or an infinitive citation takes the subject's place on the canvas.
    subjectDropped: Boolean(selection.imperative || selection.infinitive),
  });
}
