import { SLOT_KEYED_MAPS } from "../phraseSerialize.consts.ts";
import { isConceptKey } from "./isConceptKey.ts";
import { isConjunctsKey } from "./isConjunctsKey.ts";
import { isNestedSelectionKey } from "./isNestedSelectionKey.ts";
import { isRecord } from "./isRecord.ts";

// Whether a saved value has the shape its key holds: a nested selection or a slot-keyed map is an
// object, a conjunct list a list, a concept an id. Any other key holds a scalar, and fits whatever
// was saved.
export function fitsKey(key: string, value: unknown): boolean {
  if (isNestedSelectionKey(key) || key === "modifierAdjectives" || SLOT_KEYED_MAPS.has(key)) return isRecord(value);
  if (isConjunctsKey(key)) return Array.isArray(value);
  if (isConceptKey(key)) return typeof value === "string";
  return true;
}
