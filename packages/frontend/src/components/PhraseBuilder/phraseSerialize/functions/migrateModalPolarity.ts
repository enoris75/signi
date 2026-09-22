import type { SerializedSelection } from "@signi/shared";
import { isRecord } from "./isRecord.ts";

/**
 * Saved-phrase schema v8 (A03) made polarity per word of the verb group. Before it, one
 * `verbNegative` denied the whole group and the engines put that "not" on the finite element —
 * which, with a modal, is the **modal**: "I do not want to go". It now denies the word it sits on,
 * so the same selection would read "I want to not go".
 *
 * So a selection saved at v7 or earlier that holds a modal moves its flag onto that modal, and
 * every older file goes on saying what it said. `verbModal2` needs no rule: an inner modal had no
 * negation to carry until this version.
 */
export function migrateModalPolarity(selection: SerializedSelection): SerializedSelection {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(selection)) {
    // A nested selection (a possessor) or a list of them (conjuncts) is migrated the same way, so
    // one rule covers wherever a verb phrase can be written.
    if (isRecord(value)) out[key] = migrateModalPolarity(value as SerializedSelection);
    else if (Array.isArray(value)) {
      out[key] = value.map((v) => (isRecord(v) ? migrateModalPolarity(v as SerializedSelection) : v));
    } else out[key] = value;
  }
  if (out["verbModal"] && out["verbNegative"] === true) {
    out["verbModalNegative"] = true;
    delete out["verbNegative"];
  }
  return out as SerializedSelection;
}
