import type { Concept } from "@signi/shared";
import { slotCategories, type PhraseSelection, type SlotKey } from "../interfaces.ts";

/**
 * The effective word-category of a switchable slot: the user's explicit choice (`chosen`, keyed by
 * slot), else the held word's own class (so re-picking opens on the right vocabulary), else the
 * slot's default. "" for a single-vocabulary slot (no toggle).
 */
export function slotKindFor(slot: SlotKey, chosen: Readonly<Record<string, string>>, selection: PhraseSelection): string {
  const cats = slotCategories(slot);
  if (!cats) return "";
  const stored = chosen[slot];
  if (stored != null) return stored;
  const held = selection[slot] as Concept | undefined;
  if (held?.role && cats.options.some((o) => o.value === held.role)) return held.role;
  return cats.fallback;
}
