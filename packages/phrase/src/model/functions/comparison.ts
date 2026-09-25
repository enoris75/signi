import { STANDARD_DEGREES, SUPERLATIVE_DEGREES, type Concept, type Degree } from "@signi/shared";
import type { NounKey, PhraseSelection } from "../interfaces.ts";
import { adjectiveSlots } from "../slots.ts";

/**
 * What a compared adjective's standard is under each degree (P09-E51 D1). The comparatives and the
 * equative measure against a rival ("bigger **than the dog**", STANDARD_DEGREES); the superlatives
 * pick one out of a set ("the biggest **of the dogs**", SUPERLATIVE_DEGREES), which the engine reads
 * from the same field. Only `positive` compares with nothing. The plan builder, the control's gate and
 * the ring's dimming all ask here, so the plan and the canvas cannot disagree.
 */
export const takesStandardOrSet = (degree: Degree | undefined): boolean =>
  STANDARD_DEGREES.has(degree ?? "positive") || SUPERLATIVE_DEGREES.has(degree ?? "positive");

/** Whether the standard reads as a superlative's set, which names its control and its ring (D2). */
export const readsAsSet = (degree: Degree | undefined): boolean => SUPERLATIVE_DEGREES.has(degree ?? "positive");

/**
 * Which of a noun's adjectives its standard compares (P09-E50 D1): the index, among its real
 * adjectives (a noun modifier is none, as `modifiers` drops it from `adjectives`), of the first whose
 * degree takes a standard (STANDARD_DEGREES). Undefined when none compares: the standard is then kept
 * and muted. The plan's index, the control's gate and the ring's dimming all read it.
 */
export function comparedAdjectiveIndex(sel: PhraseSelection, which: NounKey): number | undefined {
  let i = 0;
  for (const key of adjectiveSlots(which)) {
    const c = sel[key as keyof PhraseSelection] as Concept | undefined;
    if (!c || c.role === "noun") continue;
    if (STANDARD_DEGREES.has(sel.adjectiveDegrees?.[key] ?? "positive")) return i;
    i++;
  }
  return undefined;
}
