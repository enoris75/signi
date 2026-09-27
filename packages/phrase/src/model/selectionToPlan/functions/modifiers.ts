import type { Concept, Degree, NounModifier } from "@signi/shared";
import type { NounKey, PhraseSelection } from "../../interfaces.ts";
import { slotModifierRelation } from "../../functions/modifierRelation.ts";
import { adjectiveSlots } from "../../slots.ts";
import type { NounModifiers } from "../selectionToPlan.types.ts";
import { field } from "./field.ts";

// Split the adjective slots of a noun block by the picked concept's role: real
// adjectives become `adjectives`, nouns become attributive `nounModifiers` carrying the
// slot's chosen relation, else the pair's default (P14 D1: resolved here, so the plan always carries
// one). This is the "Adjective ⇄ Noun" switch.
export function modifiers(sel: PhraseSelection, which: NounKey): NounModifiers {
  const adjectives: string[] = [];
  // Index-aligned with `adjectives`: each real adjective's chosen degree (default 'positive').
  const adjectiveDegrees: Degree[] = [];
  const nounModifiers: NounModifier[] = [];
  for (const key of adjectiveSlots(which)) {
    const c = field<Concept>(sel, key);
    if (!c) continue;
    if (c.role === "noun") {
      const relation = slotModifierRelation(sel, key);
      // The modifier's own number ("di frasi") and any adjective modifying it ("di frasi
      // semantiche") — both scoped to the modifier, not the head. Omit when at defaults.
      const number = sel.modifierNumbers?.[key];
      const modAdj = sel.modifierAdjectives?.[key];
      nounModifiers.push({
        concept: c.id,
        relation,
        ...(number === "plural" && { number }),
        ...(modAdj && { adjectives: [modAdj.id] }),
      });
    } else {
      adjectives.push(c.id);
      adjectiveDegrees.push(sel.adjectiveDegrees?.[key] ?? "positive");
    }
  }
  return { adjectives, adjectiveDegrees, nounModifiers };
}
