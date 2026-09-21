import { useState } from "react";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import { useUiString } from "../../../i18n/useUiString.ts";
import { COORD_CONJUNCTION_LABEL_KEY } from "../interfaces.ts";
import { ConjunctionMenu } from "./ConjunctionMenu.tsx";
import { BorderControlButton } from "./ControlButton.tsx";
import { relationButtonState } from "./functions/relationButtonState.ts";
import { ACCENT, type CoordinativeControl } from "./PeriodContainer.types.ts";

export interface CoordinationButtonProps {
  control: CoordinativeControl;
}

// The border control for a coordination. It mirrors the conditional one, but starting a
// coordination opens a conjunction menu (AND / OR / BUT / …) before entering pick-mode; picking a
// target then creates the link with the chosen conjunction.
export function CoordinationButton({ control }: CoordinationButtonProps) {
  const t = useUiString();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const { active, droppable, face, action } = relationButtonState({
    source: control.hasCoordination,
    target: control.isCoordinated,
    isPickTarget: control.isPickTarget,
    pickActive: control.pickActive,
    canStart: control.canStart,
  });
  const conjunction = control.conjunction
    ? t(COORD_CONJUNCTION_LABEL_KEY[control.conjunction])
    : "";
  // Picking this period "as" the coordinated clause is the essive object complement (C12); the
  // conjunction in brackets is the catalog's word for it too (C13), so the whole tooltip is
  // localized — "Rimuovi la coordinazione (Ma)", "Koordination entfernen (Aber)".
  const title =
    face === "droppable"
      ? t("action.useAsCoordinated")
      : face === "source"
        ? `${t("action.removeCoordination")} (${conjunction})`
        : face === "target"
          ? `${t("period.isCoordinated")} (${conjunction})`
          : t("action.coordinatePeriod");

  return (
    <>
      <BorderControlButton
        title={title}
        data-kb-control="coordinate"
        icon={CallMergeIcon}
        accent={ACCENT.coordinative}
        lit={active || droppable}
        disabled={action === null}
        onClick={(e) => {
          if (action === "pick") control.onPick();
          else if (action === "clear") control.onClear();
          else if (action === "start") setMenuAnchor(e.currentTarget);
        }}
      />
      <ConjunctionMenu
        anchorEl={menuAnchor}
        options={control.conjunctions}
        onSelect={(value) => {
          setMenuAnchor(null);
          control.onStart(value);
        }}
        onClose={() => setMenuAnchor(null)}
      />
    </>
  );
}
