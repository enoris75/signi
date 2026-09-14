import { Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useUiString } from "../../../i18n/useUiString.ts";
import { ControlButton } from "./ControlButton.tsx";

export interface HeaderControlsProps {
  compact: boolean;
  // Does the canvas hold at least one dotted role box? The compact and tidy controls
  // have nothing to act on until it does.
  hasGroups: boolean;
  // Has the user put anything in this period? Gates the save control and the
  // remove-confirmation prompt.
  hasContent: boolean;
  // This is the only period in the workspace, so it can't be deleted — the remove
  // control clears its content in place instead.
  soleContainer: boolean;
  // Move this period one place up/down the workspace stack. Left undefined at the ends
  // of the stack, where the control shows disabled.
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSave?: () => void;
  onRemove?: () => void;
  onToggleCompact: () => void;
  onTidy: () => void;
}

// The period-level controls in the card's header: reorder, compact, tidy, save and remove.
export function HeaderControls({
  compact,
  hasGroups,
  hasContent,
  soleContainer,
  onMoveUp,
  onMoveDown,
  onSave,
  onRemove,
  onToggleCompact,
  onTidy,
}: HeaderControlsProps) {
  const t = useUiString();
  const compactTitle = t(compact ? "action.expandPeriod" : "action.compactPeriod");
  const removeTitle = t(soleContainer ? "action.clearPeriod" : "action.removePeriod");

  return (
    <Box data-testid="period-controls" sx={{ display: "flex", alignItems: "center" }}>
      {/* Reorder within the workspace stack. Both controls stay mounted while the
          workspace holds more than one period, so the cluster doesn't shift width
          as a period reaches an end; the one with nowhere to go is disabled. */}
      {!soleContainer && (
        <>
          <ControlButton
            title={t("action.movePeriodUp")}
            icon={ArrowUpwardIcon}
            onClick={onMoveUp}
            disabled={!onMoveUp}
          />
          <ControlButton
            title={t("action.movePeriodDown")}
            icon={ArrowDownwardIcon}
            onClick={onMoveDown}
            disabled={!onMoveDown}
          />
        </>
      )}
      {hasGroups && (
        <ControlButton
          title={compactTitle}
          icon={compact ? UnfoldMoreIcon : UnfoldLessIcon}
          onClick={onToggleCompact}
          data-testid="period-compact-toggle"
          data-compact={compact ? "true" : "false"}
          color={compact ? "primary" : "default"}
        />
      )}
      {hasGroups && (
        <ControlButton
          title={t("action.tidyPeriod")}
          icon={AutoFixHighIcon}
          onClick={onTidy}
          data-testid="period-tidy"
        />
      )}
      {onSave && (
        <ControlButton
          title={t("action.savePeriod")}
          icon={SaveOutlinedIcon}
          onClick={onSave}
          // Nothing to save until the clause has content.
          disabled={!hasContent}
        />
      )}
      {/* The sole period can't be removed (the workspace always keeps one), so its
          control clears the content in place. Hide it when there's nothing to clear;
          a removable (non-sole) container keeps its remove control even when empty. */}
      {onRemove && (!soleContainer || hasContent) && (
        <ControlButton
          title={removeTitle}
          aria-label={removeTitle}
          icon={soleContainer ? BackspaceOutlinedIcon : CloseIcon}
          onClick={() => {
            // Confirm only when there's work to lose; an empty clause acts silently.
            const message = soleContainer
              ? "Clear this main clause and everything in it?"
              : "Remove this main clause and everything in it?";
            if (hasContent && !window.confirm(message)) return;
            onRemove();
          }}
        />
      )}
    </Box>
  );
}
