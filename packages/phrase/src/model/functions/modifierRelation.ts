import type { Concept, ModifierRelation } from "@signi/shared";
import type { NounKey, PhraseSelection, SlotKey } from "../interfaces.ts";

/**
 * The relation a noun modifier has when the author has not set one (P14, P16): the pair's — the
 * modifier's relation under the head itself, then under the head's nearest class — else the
 * modifier's own, else `feature`. TIME is `domain` by itself ("le mosche del tempo") and `feature`
 * under a DEVICE ("la bomba a tempo").
 *
 * An unset slot means "this default", so every reader of `modifierRelations` resolves through here:
 * the plan, the chip, R / Shift+R, the console's value and printer, normalising, and plan → canvas.
 * Replacing the head re-reads an unset slot; a relation the author set stays.
 */
export function defaultModifierRelation(
  modifier: Concept | undefined,
  head?: Concept | undefined,
): ModifierRelation {
  const byHead = modifier?.modifierRelationByHead;
  if (byHead && head) {
    for (const id of [head.id, ...(head.classes ?? [])]) {
      const relation = byHead[id];
      if (relation) return relation;
    }
  }
  return modifier?.modifierRelation ?? "feature";
}

/** The noun block an adjective slot belongs to ("subjectAdjective2" → "subject"). */
const blockOf = (slotKey: SlotKey | string): NounKey => slotKey.replace(/Adjective\d?$/, "") as NounKey;

/** The default relation of the noun modifier in an adjective slot of `sel`, against its block's head. */
export function slotDefaultModifierRelation(sel: PhraseSelection, slotKey: SlotKey | string): ModifierRelation {
  const modifier = sel[slotKey as keyof PhraseSelection] as Concept | undefined;
  const head = sel[blockOf(slotKey) as keyof PhraseSelection] as Concept | undefined;
  return defaultModifierRelation(modifier, head);
}

/** The relation the noun modifier in an adjective slot renders with: the author's, else the default. */
export function slotModifierRelation(sel: PhraseSelection, slotKey: SlotKey | string): ModifierRelation {
  return sel.modifierRelations?.[slotKey] ?? slotDefaultModifierRelation(sel, slotKey);
}
