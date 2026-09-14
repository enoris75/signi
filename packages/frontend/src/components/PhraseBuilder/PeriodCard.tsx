import { useState, type ReactNode, type Ref } from "react";
import { Box } from "@mui/material";
import type { PhraseSelection, WorkspaceBinding } from "./interfaces.ts";
import { MIN_GRAPH_HEIGHT } from "./slots.ts";
import { PeriodContainer, periodControls } from "./PeriodContainer.tsx";
import { Resizer } from "./Resizer.tsx";

export interface PeriodCardProps {
  selection: PhraseSelection;
  // The workspace container's linking hooks; undefined for a standalone period.
  binding?: WorkspaceBinding;
  // A noun phrase inside a period wearing the card: it takes no part in the period's moods or
  // connectors (see PeriodContainer `nested`).
  nested: boolean;
  compact: boolean;
  showCanvas: boolean;
  hasGroups: boolean;
  hasContent: boolean;
  soleContainer: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSave?: () => void;
  onRemove?: () => void;
  onToggleCompact: () => void;
  onTidy: () => void;
  onToggleImperative: () => void;
  onToggleInfinitive: () => void;
  // The header controls, for the canvas to pack clear of in compact view.
  controlsRef?: Ref<HTMLDivElement>;
  // The full-view canvas height the card's bottom edge resizes.
  graphHeight: number;
  onGraphHeightChange: (height: number) => void;
  // Shown beside the card: the page's words panel, which only the outermost period has.
  sidebar?: ReactNode;
  // The period's canvas.
  children: ReactNode;
}

// A mood can't be flipped on a period alone while it takes part in a conditional or a coordination:
// a command is mutually exclusive with a conditional and shared by the two clauses of a
// coordination, and an infinitive occupies the finite slot the same way. The relation has to be
// cleared first.
const moodLocked = (binding: WorkspaceBinding | undefined): boolean =>
  binding
    ? binding.conditional.hasSource ||
      binding.conditional.hasTarget ||
      binding.coordinative.hasSource ||
      binding.coordinative.hasTarget
    : false;

// The card a period's canvas wears: the period's header and border controls, the canvas's resize
// grip, and — for a standalone period — the border drag that floats it about the viewport.
export function PeriodCard({
  selection,
  binding,
  nested,
  compact,
  showCanvas,
  hasGroups,
  hasContent,
  soleContainer,
  onMoveUp,
  onMoveDown,
  onSave,
  onRemove,
  onToggleCompact,
  onTidy,
  onToggleImperative,
  onToggleInfinitive,
  controlsRef,
  graphHeight,
  onGraphHeightChange,
  sidebar,
  children,
}: PeriodCardProps) {
  // Where a standalone card has been dragged to by its border, in viewport pixels; null while it
  // sits in the page flow. The drag itself lives in PeriodContainer, but the state is held here
  // because this component's outer Box is what goes `fixed`.
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  // The Paper's padding, in theme spacing units. The resize grip negates it to sit flush
  // with the container's bottom border, so the two must stay in step.
  const paperPad = compact ? 1 : 2;
  // The clause-level connector controls on the card border, derived from the workspace binding
  // (undefined for a standalone period). See periodControls in PeriodContainer.tsx.
  const clauseControls = nested ? {} : periodControls(binding, selection);
  const locked = moodLocked(binding);

  return (
    <Box
      data-testid="period-container"
      data-container-id={binding?.containerId}
      sx={{
        position: position ? "fixed" : "relative",
        ...(position && { left: `${position.x}px`, top: `${position.y}px` }),
        zIndex: position ? 50 : "auto",
      }}
    >
      <PeriodContainer
        paperPad={paperPad}
        compact={compact}
        showCanvas={showCanvas}
        hasGroups={hasGroups}
        hasContent={hasContent}
        soleContainer={soleContainer}
        nested={nested}
        // A workspace container stays in the managed stack so the cross-container
        // connectors measure correctly; only a standalone period may be floated.
        floatable={!binding && !nested}
        position={position}
        onPositionChange={setPosition}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onSave={onSave}
        onRemove={onRemove}
        onToggleCompact={onToggleCompact}
        onTidy={onTidy}
        controlsRef={controlsRef}
        conditional={clauseControls.conditional}
        coordinative={clauseControls.coordinative}
        instrumental={clauseControls.instrumental}
        imperative={
          nested ? undefined : { active: Boolean(selection.imperative), disabled: locked, onToggle: onToggleImperative }
        }
        infinitive={
          nested ? undefined : { active: Boolean(selection.infinitive), disabled: locked, onToggle: onToggleInfinitive }
        }
      >
        {children}

        {/* The container's own bottom edge is the resize grip, so it bleeds back through
            the Paper's padding. No manual resize while compact — the canvas is auto-sized
            to hug the chips, and the resizer's tall minimum would fight that. */}
        {!compact && (
          <Box sx={{ mt: 2, mx: -paperPad, mb: -paperPad }}>
            <Resizer
              height={graphHeight}
              minHeight={MIN_GRAPH_HEIGHT}
              onResize={onGraphHeightChange}
              onResizeEnd={(h) => {
                localStorage.setItem("signi:graphHeight", String(Math.round(h)));
              }}
            />
          </Box>
        )}
      </PeriodContainer>

      {sidebar}
    </Box>
  );
}
