import AltRouteIcon from "@mui/icons-material/AltRoute";
import { useUiString } from "../../../i18n/useUiString.ts";
import { BorderControlButton } from "./ControlButton.tsx";
import { relationButtonState } from "./functions/relationButtonState.ts";
import { ACCENT, type ConditionalControl } from "./PeriodContainer.types.ts";

export interface ConditionalButtonProps {
  control: ConditionalControl;
}

// The border control for a conditional: choose this period as the pending pick's IF clause; else
// clear an attached condition; else start a new conditional, with this period as the main clause.
export function ConditionalButton({ control }: ConditionalButtonProps) {
  const t = useUiString();
  const { active, droppable, face, action } = relationButtonState({
    source: control.hasCondition,
    target: control.isIfClause,
    isPickTarget: control.isPickTarget,
    pickActive: control.pickActive,
    canStart: control.canStart,
  });
  // Picking this period "as" the condition needs a complement the engine lacks, so that face stays
  // English. Starting a condition makes this period the main clause, which the control says in brackets.
  const title =
    face === "droppable"
      ? "Use this period as the IF condition"
      : face === "source"
        ? t("action.removeCondition")
        : face === "target"
          ? t("period.isConditional")
          : `${t("action.addCondition")} (${t("period.becomesMain")})`;
  return (
    <BorderControlButton
      title={title}
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
