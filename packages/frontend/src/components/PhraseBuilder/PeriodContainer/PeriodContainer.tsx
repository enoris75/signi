import type React from "react";
import { Box, Paper } from "@mui/material";
import { BorderControls } from "./BorderControls.tsx";
import { periodAccent, pickTarget } from "./functions/periodAppearance.ts";
import { HeaderControls, type HeaderControlsProps } from "./HeaderControls.tsx";
import { useBorderDrag } from "./hooks/useBorderDrag.ts";
import { PeriodCaption } from "./PeriodCaption.tsx";
import type { ClauseControls } from "./PeriodContainer.types.ts";
import { ReificationSwitch } from "./ReificationSwitch.tsx";
import { PrivativeSwitch } from "./PrivativeSwitch.tsx";
import { PICK_INDEX, PICK_TARGET, pickBadgeSx } from "../../../keyboard/usePickKeys.ts";
import { useUiString } from "../../../i18n/useUiString.ts";

export interface PeriodContainerProps extends ClauseControls, HeaderControlsProps {
  // The card's padding, in theme spacing units. The caller's resize grip negates it to
  // sit flush with the bottom border, so the two must stay in step.
  paperPad: number;
  // Whether the canvas is drawn yet — the caption tells the user what to do next.
  showCanvas: boolean;
  // May this card be torn off its place in the page flow and dragged by its border?
  // False for a workspace container, which stays in the managed stack so the
  // cross-container connectors measure correctly.
  floatable: boolean;
  // Where the card has been dragged to, in viewport pixels; null while it sits in flow.
  // The owner holds this state because its outer Box is what actually goes `fixed`.
  position: { x: number; y: number } | null;
  onPositionChange: (position: { x: number; y: number }) => void;
  // The header controls, for the owner to measure: compact view floats them over the canvas's
  // top-right corner, and the canvas packs its words clear of them.
  controlsRef?: React.Ref<HTMLDivElement>;
  // A period the console's line would make, not yet made: a dashed card, captioned as a preview.
  preview?: boolean;
  // The number the console's link list gives this period (see ConsoleMarks.numbers).
  consoleNumber?: number;
  children: React.ReactNode;
}

// The card a top-level period lives in: the accent chrome, the clause-level controls on its border,
// the labelled header with the period-level controls (reorder, compact, tidy, save, remove), and the
// border-drag that floats a standalone card around the viewport. Its `children` are the period's own
// content — the canvas and the resize grip. (A period's nested phrases — conjuncts and owners — are
// rings on its canvas, and wear no card.)
export function PeriodContainer({
  paperPad,
  compact,
  showCanvas,
  floatable,
  position,
  onPositionChange,
  controlsRef,
  preview = false,
  consoleNumber,
  conditional,
  coordinative,
  subordinate,
  instrumental,
  imperative,
  infinitive,
  question,
  children,
  ...headerControls
}: PeriodContainerProps) {
  const t = useUiString();
  const controls = { conditional, coordinative, subordinate, instrumental, imperative, infinitive, question };
  const { dragging, dragHandlers } = useBorderDrag({
    enabled: floatable,
    position,
    onPositionChange,
  });
  const target = pickTarget(controls);
  const accent = periodAccent(controls);
  // The border stack is centred on the card's right edge, so the card is never shorter than it
  // (widen, never hide: the canvas rule). Measured 2026-09-23: a compact *cat eats mouse* card is
  // 142px tall, and five controls stack to 156px (28px each, 4px apart), standing 7px out of it at
  // either end. So the card grows to the stack plus 8px clear of the border at either end: each
  // 28px control and its 4px gap, less the last gap, plus 16 — 172px for five, 204px for all six
  // (command, infinitive, question, conditional, coordination, subordinate clause).
  const borderControls = [imperative, infinitive, question, conditional, coordinative, subordinate].filter(Boolean).length;
  const minHeight = borderControls ? `${borderControls * 32 - 4 + 16}px` : undefined;

  return (
    <Paper
      elevation={0}
      {...dragHandlers}
      // While a pick is pending, the whole card is lit as the drop target, so the whole card
      // takes the click — not just the border control. The control's own click bubbles here
      // too, but the second call is a no-op: the pick is already resolved.
      onClick={target ? () => controls[target]?.onPick() : undefined}
      // While a pick is in flight this card is one of the places it could land, and it is numbered
      // where it sits so a digit can take it (see usePickKeys).
      {...(target ? { [PICK_TARGET]: target } : {})}
      {...(consoleNumber !== undefined ? { [PICK_INDEX]: consoleNumber } : {})}
      sx={{
        ...(target || consoleNumber !== undefined ? pickBadgeSx : {}),
        p: paperPad,
        minHeight,
        // Compact floats its controls into the top-right corner, so the Paper is the
        // positioning context for that overlay.
        position: "relative",
        border: preview ? "1.5px dashed" : "1px solid",
        borderColor: preview ? "primary.main" : accent.borderColor,
        borderLeft: preview ? "3px dashed" : "3px solid",
        borderLeftColor: preview ? "primary.main" : accent.borderLeftColor,
        boxShadow: accent.boxShadow,
        mr: accent.gutter ? "64px" : 0,
        transition: "margin 0.15s ease",
        bgcolor: "action.hover",
        cursor: target
          ? "pointer"
          : position
            ? dragging
              ? "grabbing"
              : "default"
            : undefined,
      }}
    >
      <BorderControls
        conditional={conditional}
        coordinative={coordinative}
        subordinate={subordinate}
        imperative={imperative}
        infinitive={infinitive}
        question={question}
      />
      <Box
        ref={controlsRef}
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
        {/* The caption and the reification switch are chrome the compact overview doesn't need. */}
        {!compact && preview && (
          <Box
            data-testid="period-preview"
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            · {t("status.preview")}
          </Box>
        )}
        {!compact && !preview && <PeriodCaption controls={controls} showCanvas={showCanvas} />}
        {!compact && instrumental?.isInstrument && (
          <ReificationSwitch
            level={instrumental.level}
            onChange={instrumental.onLevelChange}
          />
        )}
        {!compact && instrumental?.isInstrument && (
          <PrivativeSwitch
            negative={instrumental.negative}
            onChange={instrumental.onNegativeChange}
          />
        )}
        <HeaderControls compact={compact} {...headerControls} />
      </Box>

      {children}
    </Paper>
  );
}
