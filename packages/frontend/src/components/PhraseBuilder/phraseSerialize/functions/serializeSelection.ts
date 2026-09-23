import type { Concept, SerializedSelection } from "@signi/shared";
import type { PhraseSelection } from "../../interfaces.ts";
import { isConceptKey } from "./isConceptKey.ts";
import { isConjunctsKey } from "./isConjunctsKey.ts";
import { isNestedSelectionKey } from "./isNestedSelectionKey.ts";

// A selection with every Concept replaced by its id, nested possessors, standards and conjuncts included.
export function serializeSelection(selection: PhraseSelection): SerializedSelection {
  const out: SerializedSelection = {};
  for (const [key, value] of Object.entries(selection)) {
    if (value == null) continue;
    if (isNestedSelectionKey(key)) {
      out[key] = serializeSelection(value as PhraseSelection);
    } else if (isConjunctsKey(key)) {
      out[key] = (value as PhraseSelection[]).map(serializeSelection);
    } else if (isConceptKey(key)) {
      out[key] = (value as Concept).id;
    } else if (key === "modifierAdjectives") {
      // A map of slot key → Concept (an adjective on a noun-modifier); encode each to its id.
      out[key] = Object.fromEntries(
        Object.entries(value as Record<string, Concept>).map(([k, c]) => [k, c.id]),
      );
    } else {
      // Scalars (number/gender/definiteness/tense/negative/specifier) and the string-valued
      // `modifierRelations` / `modifierNumbers` maps carry through untouched.
      out[key] = value;
    }
  }
  return out;
}
