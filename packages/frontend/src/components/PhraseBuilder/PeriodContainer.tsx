import React, { useRef, useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import {
  COORD_CONJUNCTION_LABEL,
  COORD_CONJUNCTION_OPTIONS,
  type CoordConjunction,
} from "./interfaces.ts";

// The container-to-container conditional control state, threaded from the workspace binding.
// Undefined for a standalone (non-workspace) period, which can't take part in conditionals.
export interface ConditionalControl {
  // This period is a main clause — it already has an attached IF condition.
  hasCondition: boolean;
  // This period is itself the IF clause of some other (main) period.
  isIfClause: boolean;
  // A conditional pick is in progress and this period is a legal IF-clause target.
  isPickTarget: boolean;
  // Any pick (relative or conditional) is currently in progress.
  pickActive: boolean;
  // May this period start a conditional (false for an IF clause — conditionals don't chain).
  canStart: boolean;
  onStart: () => void;
  onClear: () => void;
  onPick: () => void;
  registerBorderAnchor: (el: HTMLElement | null) => void;
}

// The container-to-container coordinative control state, threaded from the workspace binding.
// Mirrors ConditionalControl, but starting a coordination first picks a conjunction (AND / OR /
// BUT / THAT IS / THEN) from a menu, then a second-clause target. Undefined for a standalone
// (non-workspace) period, which can't take part in coordinations.
export interface CoordinativeControl {
  // This period is the first clause — it already coordinates a second clause.
  hasCoordination: boolean;
  // This period is itself the coordinated (second) clause of some other period.
  isCoordinated: boolean;
  // The conjunction of the coordination this period takes part in, if any (for labelling).
  conjunction?: CoordConjunction;
  // A coordinative pick is in progress and this period is a legal second-clause target.
  isPickTarget: boolean;
  // Any pick (relative / conditional / coordinative) is currently in progress.
  pickActive: boolean;
  // May this period start a coordination (false for a period already tied into another relation).
  canStart: boolean;
  onStart: (conjunction: CoordConjunction) => void;
  onClear: () => void;
  onPick: () => void;
}

export interface PeriodContainerProps {
  // The card's padding, in theme spacing units. The caller's resize grip negates it to
  // sit flush with the bottom border, so the two must stay in step.
  paperPad: number;
  compact: boolean;
  // Whether the canvas is drawn yet — the caption tells the user what to do next.
  showCanvas: boolean;
  // Does the canvas hold at least one dotted role box? The compact and tidy controls
  // have nothing to act on until it does.
  hasGroups: boolean;
  // Has the user put anything in this period? Gates the save control and the
  // remove-confirmation prompt.
  hasContent: boolean;
  // This is the only period in the workspace, so it can't be deleted — the remove
  // control clears its content in place instead.
  soleContainer: boolean;
  // May this card be torn off its place in the page flow and dragged by its border?
  // False for a workspace container, which stays in the managed stack so the
  // cross-container connectors measure correctly.
  floatable: boolean;
  // Where the card has been dragged to, in viewport pixels; null while it sits in flow.
  // The owner holds this state because its outer Box is what actually goes `fixed`.
  position: { x: number; y: number } | null;
  onPositionChange: (position: { x: number; y: number }) => void;
  // Move this period one place up/down the workspace stack. Left undefined at the ends
  // of the stack, where the control shows disabled.
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSave?: () => void;
  onRemove?: () => void;
  onToggleCompact: () => void;
  onTidy: () => void;
  // Conditional (IF/MAIN) connector control on the card border. Absent for a standalone period.
  conditional?: ConditionalControl;
  // Coordinative (AND/OR/BUT/…) connector control on the card border. Absent for a standalone period.
  coordinative?: CoordinativeControl;
  children: React.ReactNode;
}

// The card a top-level period lives in: the accent chrome, the labelled header with the
// period-level controls (reorder, compact, tidy, save, remove), and the border-drag that
// floats a standalone card around the viewport. Its `children` are the period's own
// content — the canvas, the resize grip, and any possessor panels.
//
// A nested clause or a possessor is not a period and does not use this; PhraseBuilder
// draws their plainer chrome inline.
export function PeriodContainer({
  paperPad,
  compact,
  showCanvas,
  hasGroups,
  hasContent,
  soleContainer,
  floatable,
  position,
  onPositionChange,
  onMoveUp,
  onMoveDown,
  onSave,
  onRemove,
  onToggleCompact,
  onTidy,
  conditional,
  coordinative,
  children,
}: PeriodContainerProps) {
  const [coordMenuAnchor, setCoordMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const borderDragRef = useRef<{
    startX: number;
    startY: number;
    startPos: { x: number; y: number };
  } | null>(null);

  function startBorderDrag(e: React.PointerEvent<HTMLDivElement>) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    borderDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: position ?? { x: 0, y: 0 },
    };
  }

  function moveBorderDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!borderDragRef.current) return;
    const dx = e.clientX - borderDragRef.current.startX;
    const dy = e.clientY - borderDragRef.current.startY;
    onPositionChange({
      x: borderDragRef.current.startPos.x + dx,
      y: borderDragRef.current.startPos.y + dy,
    });
  }

  function endBorderDrag() {
    borderDragRef.current = null;
  }

  // The border IF-control's behaviour: choose this period as the pending pick's IF clause; else
  // clear an attached condition; else start a new conditional (this period becomes the main clause).
  const condActive = Boolean(
    conditional?.hasCondition || conditional?.isIfClause,
  );
  const condDroppable = Boolean(conditional?.isPickTarget);
  const condDisabled = conditional
    ? conditional.pickActive
      ? !conditional.isPickTarget
      : !conditional.hasCondition && !conditional.canStart
    : true;
  function onCondClick() {
    if (!conditional) return;
    if (conditional.pickActive) {
      if (conditional.isPickTarget) conditional.onPick();
      return;
    }
    if (conditional.hasCondition) conditional.onClear();
    else if (conditional.canStart) conditional.onStart();
  }
  const condTitle = !conditional
    ? ""
    : condDroppable
      ? "Use this period as the IF condition"
      : conditional.hasCondition
        ? "Remove the IF condition"
        : conditional.isIfClause
          ? "This period is an IF clause"
          : "Add an IF condition (this becomes the main clause)";

  // The coordinative control mirrors the conditional one, but starting a coordination opens a
  // conjunction menu (AND / OR / BUT / …) before entering pick-mode; picking a target then
  // creates the link with the chosen conjunction.
  const coordActive = Boolean(
    coordinative?.hasCoordination || coordinative?.isCoordinated,
  );
  const coordDroppable = Boolean(coordinative?.isPickTarget);
  const coordDisabled = coordinative
    ? coordinative.pickActive
      ? !coordinative.isPickTarget
      : !coordinative.hasCoordination && !coordinative.canStart
    : true;
  function onCoordClick(e: React.MouseEvent<HTMLElement>) {
    if (!coordinative) return;
    if (coordinative.pickActive) {
      if (coordinative.isPickTarget) coordinative.onPick();
      return;
    }
    if (coordinative.hasCoordination) coordinative.onClear();
    else if (coordinative.canStart) setCoordMenuAnchor(e.currentTarget);
  }
  const coordLabel = coordinative?.conjunction
    ? COORD_CONJUNCTION_LABEL[coordinative.conjunction]
    : "";
  const coordTitle = !coordinative
    ? ""
    : coordDroppable
      ? "Use this period as the coordinated clause"
      : coordinative.hasCoordination
        ? `Remove the coordination (${coordLabel})`
        : coordinative.isCoordinated
          ? `This period is a coordinated clause (${coordLabel})`
          : "Coordinate this period with another";

  return (
    <Paper
      elevation={0}
      onPointerDown={(e) => {
        if (!floatable) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const borderWidth = 8;
        const isNearBorder =
          e.clientX - rect.left < borderWidth ||
          e.clientX - rect.left > rect.width - borderWidth ||
          e.clientY - rect.top < borderWidth ||
          e.clientY - rect.top > rect.height - borderWidth;
        if (isNearBorder) {
          startBorderDrag(e as React.PointerEvent<HTMLDivElement>);
        }
      }}
      onPointerMove={(e) => {
        if (borderDragRef.current) {
          moveBorderDrag(e as React.PointerEvent<HTMLDivElement>);
        }
      }}
      onPointerUp={endBorderDrag}
      onPointerCancel={endBorderDrag}
      sx={{
        p: paperPad,
        // Compact floats its controls into the top-right corner, so the Paper is the
        // positioning context for that overlay.
        position: "relative",
        // The period's accent card: left rule + tinted bg. A pending pick lights the border to
        // mark this period as a droppable target — warning (orange) for a conditional IF-clause,
        // info (blue) for a coordinated clause.
        border: "1px solid",
        borderColor: condDroppable
          ? "warning.main"
          : coordDroppable
            ? "info.main"
            : "divider",
        borderLeft: "3px solid",
        borderLeftColor: condDroppable
          ? "warning.main"
          : coordDroppable
            ? "info.main"
            : condActive
              ? "warning.main"
              : coordActive
                ? "info.main"
                : "text.secondary",
        boxShadow: condDroppable
          ? "0 0 0 2px rgba(237,108,2,0.35)"
          : coordDroppable
            ? "0 0 0 2px rgba(2,136,209,0.35)"
            : undefined,
        // Once this period takes part in a conditional/coordination, give up a strip on the right
        // so the elbow connector routes in the freed gutter instead of over the border.
        mr: condActive || coordActive ? "64px" : 0,
        transition: "margin 0.15s ease",
        bgcolor: "action.hover",
        cursor:
          borderDragRef.current && position
            ? "grabbing"
            : position
              ? "default"
              : undefined,
      }}
    >
      {/* The clause-relation controls (conditional above, coordinative below), stacked on the
          card's right border. Both connectors run from this cluster's registered anchor. */}
      {(conditional || coordinative) && (
        <Box
          ref={conditional?.registerBorderAnchor}
          onPointerDown={(e) => e.stopPropagation()}
          sx={{
            position: "absolute",
            right: -14,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {conditional && (
            <Tooltip title={condTitle}>
              <span>
                <IconButton
                  size="small"
                  onClick={onCondClick}
                  disabled={condDisabled}
                  aria-label={condTitle}
                  sx={{
                    p: 0.25,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: condDroppable
                      ? "warning.main"
                      : condActive
                        ? "warning.main"
                        : "divider",
                    color:
                      condActive || condDroppable
                        ? "warning.main"
                        : "text.secondary",
                    "&:hover": { bgcolor: "background.paper" },
                  }}
                >
                  <AltRouteIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
          {coordinative && (
            <Tooltip title={coordTitle}>
              <span>
                <IconButton
                  size="small"
                  onClick={onCoordClick}
                  disabled={coordDisabled}
                  aria-label={coordTitle}
                  sx={{
                    p: 0.25,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: coordDroppable
                      ? "info.main"
                      : coordActive
                        ? "info.main"
                        : "divider",
                    color:
                      coordActive || coordDroppable
                        ? "info.main"
                        : "text.secondary",
                    "&:hover": { bgcolor: "background.paper" },
                  }}
                >
                  <CallMergeIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
      )}
      {/* Conjunction picker for a new coordination (AND / OR / BUT / THAT IS / THEN). */}
      <Menu
        anchorEl={coordMenuAnchor}
        open={Boolean(coordMenuAnchor)}
        onClose={() => setCoordMenuAnchor(null)}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
        transformOrigin={{ vertical: "center", horizontal: "left" }}
      >
        {COORD_CONJUNCTION_OPTIONS.map((o) => (
          <MenuItem
            key={o.value}
            dense
            onClick={() => {
              setCoordMenuAnchor(null);
              coordinative?.onStart(o.value);
            }}
          >
            <Typography component="span" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
              {o.label}
            </Typography>
            <Typography
              component="span"
              sx={{ ml: 1, color: "text.disabled", fontSize: "0.72rem" }}
            >
              {o.hint}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          // Compact drops the label and floats the controls into the top-right corner
          // (absolute), so they reserve no vertical space and the chips rise to the top
          // of the reclaimed area; full view keeps the labelled header in flow.
          ...(compact
            ? {
                position: "absolute",
                top: 6,
                right: 6,
                zIndex: 4,
                m: 0,
              }
            : { mb: 1.5 }),
        }}
      >
        {/* The "Main clause · …" caption is chrome the compact overview doesn't need. */}
        {!compact && (
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            {conditional?.hasCondition
              ? "Main clause"
              : conditional?.isIfClause
                ? "If clause"
                : coordinative?.hasCoordination
                  ? "First clause"
                  : coordinative?.isCoordinated
                    ? `${coordLabel} clause`
                    : ""}
            <Box
              component="span"
              sx={{ color: "text.disabled", fontWeight: 500 }}
            >
              ·{" "}
              {showCanvas
                ? "click a slot then choose a word"
                : "start by choosing a subject"}
            </Box>
          </Typography>
        )}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Reorder within the workspace stack. Both controls stay mounted while the
              workspace holds more than one period, so the cluster doesn't shift width
              as a period reaches an end; the one with nowhere to go is disabled. */}
          {!soleContainer && (
            <>
              <Tooltip title="Move this period up">
                <span>
                  <IconButton
                    size="small"
                    onClick={onMoveUp}
                    disabled={!onMoveUp}
                    aria-label="Move this period up"
                    sx={{ p: 0.25 }}
                  >
                    <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Move this period down">
                <span>
                  <IconButton
                    size="small"
                    onClick={onMoveDown}
                    disabled={!onMoveDown}
                    aria-label="Move this period down"
                    sx={{ p: 0.25 }}
                  >
                    <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}
          {hasGroups && (
            <Tooltip
              title={compact ? "Expand this period" : "Compact this period"}
            >
              <IconButton
                size="small"
                onClick={onToggleCompact}
                aria-label={
                  compact ? "Expand this period" : "Compact this period"
                }
                color={compact ? "primary" : "default"}
                sx={{ p: 0.25 }}
              >
                {compact ? (
                  <UnfoldMoreIcon sx={{ fontSize: 15 }} />
                ) : (
                  <UnfoldLessIcon sx={{ fontSize: 15 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
          {hasGroups && (
            <Tooltip title="Tidy up this period">
              <IconButton
                size="small"
                onClick={onTidy}
                aria-label="Tidy up this period"
                sx={{ p: 0.25 }}
              >
                <AutoFixHighIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          )}
          {onSave && (
            <Tooltip title="Save this period">
              <span>
                <IconButton
                  size="small"
                  onClick={onSave}
                  // Nothing to save until the clause has content.
                  disabled={!hasContent}
                  aria-label="Save this period"
                  sx={{ p: 0.25 }}
                >
                  <SaveOutlinedIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
          {/* The sole period can't be removed (the workspace always keeps one), so its
              control clears the content in place. Hide it when there's nothing to clear;
              a removable (non-sole) container keeps its remove control even when empty. */}
          {onRemove && (!soleContainer || hasContent) && (
            <Tooltip
              title={soleContainer ? "Clear this period" : "Remove this period"}
            >
              <IconButton
                size="small"
                onClick={() => {
                  // Confirm only when there's work to lose; an empty clause acts silently.
                  const message = soleContainer
                    ? "Clear this main clause and everything in it?"
                    : "Remove this main clause and everything in it?";
                  if (hasContent && !window.confirm(message)) return;
                  onRemove();
                }}
                aria-label={
                  soleContainer ? "Clear main clause" : "Remove main clause"
                }
                sx={{ p: 0.25 }}
              >
                {soleContainer ? (
                  <BackspaceOutlinedIcon sx={{ fontSize: 15 }} />
                ) : (
                  <CloseIcon sx={{ fontSize: 15 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {children}
    </Paper>
  );
}
