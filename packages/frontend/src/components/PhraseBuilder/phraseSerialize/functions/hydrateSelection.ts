import type { Concept, SerializedSelection } from "@signi/shared";
import type { PhraseSelection } from "../../interfaces.ts";
import { SLOT_KEYED_MAPS } from "../phraseSerialize.consts.ts";
import { isConceptKey } from "./isConceptKey.ts";
import { isConjunctsKey } from "./isConjunctsKey.ts";
import { isPossessorKey } from "./isPossessorKey.ts";
import { migrateKey } from "./migrateKey.ts";
import { migrateKeys } from "./migrateKeys.ts";

// The inverse of serializeSelection: every id looked up in `byId`, legacy keys renamed. An id the
// catalog no longer holds is dropped from the selection and added to `missing`.
export function hydrateSelection(
  selection: SerializedSelection,
  byId: Map<string, Concept>,
  missing: Set<string>,
): PhraseSelection {
  const out: Record<string, unknown> = {};
  for (const [savedKey, value] of Object.entries(selection)) {
    if (value == null) continue;
    const key = migrateKey(savedKey);
    if (isPossessorKey(key) && typeof value === "object") {
      out[key] = hydrateSelection(value as SerializedSelection, byId, missing);
    } else if (isConjunctsKey(key) && Array.isArray(value)) {
      out[key] = (value as SerializedSelection[]).map((c) => hydrateSelection(c, byId, missing));
    } else if (isConceptKey(key) && typeof value === "string") {
      const concept = byId.get(value);
      if (concept) out[key] = concept;
      else missing.add(value); // referenced concept no longer in the catalog
    } else if (key === "modifierAdjectives" && typeof value === "object") {
      // Rehydrate the slot key → id map back to Concepts, dropping (and reporting) any id
      // no longer in the catalog.
      const resolved: Record<string, Concept> = {};
      for (const [k, id] of Object.entries(value as Record<string, string>)) {
        const concept = byId.get(id);
        if (concept) resolved[migrateKey(k)] = concept;
        else missing.add(id);
      }
      out[key] = resolved;
    } else if (SLOT_KEYED_MAPS.has(key) && typeof value === "object") {
      out[key] = migrateKeys(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out as PhraseSelection;
}
