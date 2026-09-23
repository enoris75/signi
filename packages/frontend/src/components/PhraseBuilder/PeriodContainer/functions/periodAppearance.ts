import type { UiStringKey } from "@signi/shared";
import { COORD_CONJUNCTION_LABEL_KEY, subordinateLabelKey } from "../../interfaces.ts";
import {
  ACCENT,
  type ClauseControls,
  type Mood,
  type Relation,
} from "../PeriodContainer.types.ts";

// The glow round a card lit as a pick's target, in its relation's colour.
const PICK_SHADOW: Record<Relation, string> = {
  conditional: "0 0 0 2px rgba(237,108,2,0.35)",
  coordinative: "0 0 0 2px rgba(2,136,209,0.35)",
  subordinate: "0 0 0 2px rgba(139,26,26,0.35)",
  instrumental: "0 0 0 2px rgba(139,62,42,0.35)",
};

// The relation whose pending pick this period is a legal target of, if any. While it is set the
// whole card is lit as the drop target and takes the click.
export function pickTarget({
  conditional,
  coordinative,
  subordinate,
  instrumental,
}: ClauseControls): Relation | undefined {
  if (conditional?.isPickTarget) return "conditional";
  if (coordinative?.isPickTarget) return "coordinative";
  if (subordinate?.isPickTarget) return "subordinate";
  if (instrumental?.isPickTarget) return "instrumental";
  return undefined;
}

export interface PeriodAccent {
  // The card's outline: the pick's colour while the card is a drop target, else the divider.
  borderColor: string;
  // The card's left rule, in the colour of the part the period plays.
  borderLeftColor: string;
  // The glow round a drop target.
  boxShadow?: string;
  // The card gives up a strip on its right, so the elbow connector of a relation it takes part in
  // routes in the freed gutter instead of over the border.
  gutter: boolean;
}

// The period's accent card. The left rule shows, most pressing first: a pending pick's target, then
// a conditional, a coordination, the instrument phrase, and last the mood. The header caption
// (periodLabel) ranks the other way round, mood before relation — a command that coordinates
// another wears the coordination's rule but reads "Command".
export function periodAccent(controls: ClauseControls): PeriodAccent {
  const { conditional, coordinative, subordinate, instrumental, imperative, infinitive } =
    controls;
  const target = pickTarget(controls);
  const inConditional = Boolean(
    conditional?.hasCondition || conditional?.isIfClause,
  );
  const inCoordination = Boolean(
    coordinative?.hasCoordination || coordinative?.isCoordinated,
  );
  const inSubordinate = Boolean(subordinate?.asSource || subordinate?.asTarget);
  const inInstrumental = Boolean(
    instrumental?.hasInstrument || instrumental?.isInstrument,
  );
  const rule: Relation | Mood | undefined =
    target ??
    (inConditional
      ? "conditional"
      : inCoordination
        ? "coordinative"
        : inSubordinate
          ? "subordinate"
          : instrumental?.isInstrument
          ? "instrumental"
          : imperative?.active
            ? "imperative"
            : infinitive?.active
              ? "infinitive"
              : undefined);
  return {
    borderColor: target ? ACCENT[target] : "divider",
    borderLeftColor: rule ? ACCENT[rule] : "text.secondary",
    boxShadow: target && PICK_SHADOW[target],
    gutter: inConditional || inCoordination || inSubordinate || inInstrumental,
  };
}

// The header caption's label: the part this period plays, or "" for a free statement.
export function periodLabel(
  { conditional, coordinative, subordinate, instrumental, imperative, infinitive }: ClauseControls,
  t: (key: UiStringKey) => string,
): string {
  if (instrumental?.isInstrument) return t("slot.instrumental");
  // A subordinate clause says so before its mood: the infinitive link draws its clause in the
  // infinitive, and that period is the complement first. Its word in brackets, as the coordinated
  // clause's conjunction: "Subordinate clause (When)", it "Proposizione subordinata (Quando)".
  if (subordinate?.asTarget)
    return `${t("clause.subordinate")} (${t(subordinateLabelKey(subordinate.asTarget))})`;
  if (imperative?.active) return t("imperative.command");
  if (infinitive?.active) return t("infinitive.phrase");
  if (conditional?.hasCondition) return t("clause.main");
  if (conditional?.isIfClause) return t("clause.conditional");
  if (coordinative?.hasCoordination) return t("clause.first");
  if (subordinate?.asSource) return t("clause.main");
  // The conjunction in brackets is the catalog's word for it (C13): "Coordinated clause (But)",
  // it "Proposizione coordinata (Ma)", ja 「等位節（しかし）」.
  if (coordinative?.isCoordinated) {
    return coordinative.conjunction
      ? `${t("clause.coordinated")} (${t(COORD_CONJUNCTION_LABEL_KEY[coordinative.conjunction])})`
      : t("clause.coordinated");
  }
  return "";
}
