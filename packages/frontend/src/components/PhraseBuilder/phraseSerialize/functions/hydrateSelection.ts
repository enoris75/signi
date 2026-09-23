import type { Concept, SerializedSelection } from "@signi/shared";
import type { PhraseSelection } from "../../interfaces.ts";
import { SLOT_KEYED_MAPS } from "../phraseSerialize.consts.ts";
import { fitsKey } from "./fitsKey.ts";
import { isConceptKey } from "./isConceptKey.ts";
import { isConjunctsKey } from "./isConjunctsKey.ts";
import { isNestedSelectionKey } from "./isNestedSelectionKey.ts";
import { isRecord } from "./isRecord.ts";
import { migrateKey } from "./migrateKey.ts";
import { migrateKeys } from "./migrateKeys.ts";

// The inverse of serializeSelection: every id looked up in `byId`, legacy keys renamed. An id the
// catalog no longer holds is dropped from the selection and added to `missing`.
//
// A saved selection may have been edited by hand or cut short, and the builder trusts the shape of
// what it loads: a conjunct list that is no list throws on the next render. So a value of the wrong
// shape for its key is dropped too, silently — it names no word to report.
export function hydrateSelection(
  selection: SerializedSelection,
  byId: Map<string, Concept>,
  missing: Set<string>,
): PhraseSelection {
  const out: Record<string, unknown> = {};
  for (const [savedKey, value] of Object.entries(selection)) {
    const key = migrateKey(savedKey);
    if (value == null || !fitsKey(key, value)) continue;
    if (isNestedSelectionKey(key)) {
      out[key] = hydrateSelection(value as SerializedSelection, byId, missing);
    } else if (isConjunctsKey(key)) {
      out[key] = (value as unknown[]).filter(isRecord).map((c) => hydrateSelection(c, byId, missing));
    } else if (isConceptKey(key)) {
      const concept = byId.get(value as string);
      if (concept) out[key] = concept;
      else missing.add(value as string); // referenced concept no longer in the catalog
    } else if (key === "modifierAdjectives") {
      // Rehydrate the slot key → id map back to Concepts, dropping (and reporting) any id
      // no longer in the catalog.
      const resolved: Record<string, Concept> = {};
      for (const [k, id] of Object.entries(value as Record<string, unknown>)) {
        if (typeof id !== "string") continue;
        const concept = byId.get(id);
        if (concept) resolved[migrateKey(k)] = concept;
        else missing.add(id);
      }
      out[key] = resolved;
    } else if (SLOT_KEYED_MAPS.has(key)) {
      out[key] = migrateKeys(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out as PhraseSelection;
}
