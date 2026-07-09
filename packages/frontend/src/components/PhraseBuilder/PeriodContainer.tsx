import React, { useRef } from "react";
import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

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
  children,
}: PeriodContainerProps) {
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
        // The period's accent card: left rule + tinted bg.
        border: "1px solid",
        borderColor: "divider",
        borderLeft: "3px solid",
        borderLeftColor: "text.secondary",
        bgcolor: "action.hover",
        cursor:
          borderDragRef.current && position
            ? "grabbing"
            : position
              ? "default"
              : undefined,
      }}
    >
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
            Main clause{" "}
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
            <Tooltip title={compact ? "Expand this period" : "Compact this period"}>
              <IconButton
                size="small"
                onClick={onToggleCompact}
                aria-label={compact ? "Expand this period" : "Compact this period"}
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
