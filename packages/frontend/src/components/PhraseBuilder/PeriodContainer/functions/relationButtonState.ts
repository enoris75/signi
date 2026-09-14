// Where a period stands in one clause-level relation — a conditional or a coordination — as the
// relation's control on the card border reads it.
export interface RelationStanding {
  // This period is the relation's first end: a conditional's main clause, a coordination's first
  // clause.
  source: boolean;
  // This period is the relation's second end: the IF clause, the coordinated clause.
  target: boolean;
  // A pick for this relation is in progress and this period is a legal target for it.
  isPickTarget: boolean;
  // Any pick is in progress.
  pickActive: boolean;
  // May this period start the relation.
  canStart: boolean;
}

// What the control says it is, and so which tooltip it wears.
export type RelationFace = "droppable" | "source" | "target" | "free";

// What a click on the control does. Null when it does nothing, which is exactly when it shows
// disabled.
export type RelationAction = "pick" | "clear" | "start" | null;

export interface RelationButtonState {
  // The period takes part in the relation, at either end.
  active: boolean;
  // The period is a legal target of a pending pick for the relation.
  droppable: boolean;
  face: RelationFace;
  action: RelationAction;
}

// The rules the conditional and coordinative border controls share. While any pick is pending the
// control only takes that pick, and only on a legal target. Otherwise it clears the relation this
// period sources, or starts a new one where the period may. The target end of a relation can't
// clear it from here — that is the source's control.
export function relationButtonState({
  source,
  target,
  isPickTarget,
  pickActive,
  canStart,
}: RelationStanding): RelationButtonState {
  const face: RelationFace = isPickTarget
    ? "droppable"
    : source
      ? "source"
      : target
        ? "target"
        : "free";
  const action: RelationAction = pickActive
    ? isPickTarget
      ? "pick"
      : null
    : source
      ? "clear"
      : canStart
        ? "start"
        : null;
  return { active: source || target, droppable: isPickTarget, face, action };
}
