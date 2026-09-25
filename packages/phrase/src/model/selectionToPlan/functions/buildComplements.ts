import { DEFAULT_TEMPORAL_RELATION, type Complement, type ComplementType } from "@signi/shared";
import type { PhraseSelection } from "../../interfaces.ts";
import { BOX_COMPLEMENT_TYPES, defaultPredication } from "../../slots.ts";
import { buildNounElement } from "./buildNounElement.ts";

// The boxed complements a selection fills, each with its noun element and specifiers. Undefined
// when it fills none, so the plan omits the field.
export function buildComplements(
  sel: PhraseSelection,
): Partial<Record<ComplementType, Complement>> | undefined {
  const out: Partial<Record<ComplementType, Complement>> = {};
  for (const type of BOX_COMPLEMENT_TYPES) {
    const phrase = buildNounElement(sel, type);
    if (!phrase) continue;
    out[type] = {
      phrase,
      // The cause may be denied rather than named ("not because of the dog"). Omitted unless set,
      // so a plain cause is the plan it always was.
      ...(type === "cause" && sel.causeNegative ? { negative: true } : {}),
      // Route and locative both carry a path specifier — the same relation set, read from their
      // own key because their defaults differ (through vs in). Cause carries a sentiment
      // specifier (omit the default 'neutral' — the engine assumes it when absent).
      specifiers:
        type === "route" && sel.routeSpecifier
          ? [{ kind: "path", value: sel.routeSpecifier }]
          : type === "locative" && sel.locativeSpecifier
            ? [{ kind: "path", value: sel.locativeSpecifier }]
            : type === "direction" && sel.directionSpecifier
              ? [{ kind: "path", value: sel.directionSpecifier }]
            : type === "temporal" && sel.temporalRelation && sel.temporalRelation !== DEFAULT_TEMPORAL_RELATION
              // The temporal's relation, omitted at its default `at` as the cause omits `neutral`.
              ? [{ kind: "temporal", value: sel.temporalRelation }]
              : type === "cause" && sel.causeSentiment && sel.causeSentiment !== "neutral"
                ? [{ kind: "sentiment", value: sel.causeSentiment }]
                // What the object is taken as or turned into (P13): said wherever it is the essive,
                // which the engine's default, the factitive, is not.
                : type === "objectPredicative" &&
                    (sel.objectPredicativePredication ?? defaultPredication(sel.verb)) === "essive"
                  ? [{ kind: "predication", value: "essive" }]
                  : undefined,
    };
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
