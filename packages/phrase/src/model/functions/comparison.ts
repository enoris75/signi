import { STANDARD_DEGREES, SUPERLATIVE_DEGREES, type Degree } from "@signi/shared";

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
