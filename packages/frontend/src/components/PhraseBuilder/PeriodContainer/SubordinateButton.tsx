import { useState } from "react";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import { useUiString } from "../../../i18n/useUiString.ts";
import { subordinateLabelKey } from "../interfaces.ts";
import { BorderControlButton } from "./ControlButton.tsx";
import { relationButtonState } from "./functions/relationButtonState.ts";
import { ACCENT, type SubordinateControl } from "./PeriodContainer.types.ts";
import { SubordinateMenu } from "./SubordinateMenu.tsx";

export interface SubordinateButtonProps {
  control: SubordinateControl;
}

// The border control for a subordinate clause (P09-E12 D9): one button for the three links a period
// can govern — its object clause, an adverbial clause, its infinitive complement. It mirrors the
// coordination's: starting one opens a menu (*that*, *to*, *when*, …) before entering pick-mode, and
// picking a target then makes the link of the kind chosen.
export function SubordinateButton({ control }: SubordinateButtonProps) {
  const t = useUiString();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const { active, droppable, face, action } = relationButtonState({
    source: Boolean(control.asSource),
    target: Boolean(control.asTarget),
    isPickTarget: control.isPickTarget,
    pickActive: control.pickActive,
    canStart: control.canStart && control.options.length > 0,
  });
  // The word of the link in brackets, as the coordination's tooltip carries its conjunction.
  const standing = control.asSource ?? control.asTarget;
  const word = standing ? t(subordinateLabelKey(standing)) : "";
  const title =
    face === "droppable"
      ? t("action.useAsSubordinate")
      : face === "source"
        ? `${t("action.removeSubordinate")} (${word})`
        : face === "target"
          ? `${t("period.isSubordinate")} (${word})`
          : t("action.addSubordinate");

  return (
    <>
      <BorderControlButton
        title={title}
        data-kb-control="subordinate"
        icon={SubdirectoryArrowRightIcon}
        accent={ACCENT.subordinate}
        lit={active || droppable}
        disabled={action === null}
        onClick={(e) => {
          if (action === "pick") control.onPick();
          else if (action === "clear") control.onClear();
          else if (action === "start") setMenuAnchor(e.currentTarget);
        }}
      />
      <SubordinateMenu
        anchorEl={menuAnchor}
        options={control.options}
        onSelect={(option) => {
          setMenuAnchor(null);
          control.onStart(option.link, option.conjunction);
        }}
        onClose={() => setMenuAnchor(null)}
      />
    </>
  );
}
