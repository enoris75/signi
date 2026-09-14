import AltRouteIcon from "@mui/icons-material/AltRoute";
import { BorderControlButton } from "./ControlButton.tsx";
import {
  relationButtonState,
  type RelationFace,
} from "./functions/relationButtonState.ts";
import { ACCENT, type ConditionalControl } from "./PeriodContainer.types.ts";

const TITLES: Record<RelationFace, string> = {
  droppable: "Use this period as the IF condition",
  source: "Remove the IF condition",
  target: "This period is an IF clause",
  free: "Add an IF condition (this becomes the main clause)",
};

export interface ConditionalButtonProps {
  control: ConditionalControl;
}

// The border control for a conditional: choose this period as the pending pick's IF clause; else
// clear an attached condition; else start a new conditional, with this period as the main clause.
export function ConditionalButton({ control }: ConditionalButtonProps) {
  const { active, droppable, face, action } = relationButtonState({
    source: control.hasCondition,
    target: control.isIfClause,
    isPickTarget: control.isPickTarget,
    pickActive: control.pickActive,
    canStart: control.canStart,
  });
  return (
    <BorderControlButton
      title={TITLES[face]}
      icon={AltRouteIcon}
      accent={ACCENT.conditional}
      lit={active || droppable}
      disabled={action === null}
      onClick={() => {
        if (action === "pick") control.onPick();
        else if (action === "clear") control.onClear();
        else if (action === "start") control.onStart();
      }}
    />
  );
}
