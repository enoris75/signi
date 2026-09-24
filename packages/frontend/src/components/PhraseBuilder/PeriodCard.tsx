import { useRef, useState, type ReactNode, type Ref } from "react";
import { Box } from "@mui/material";
import { pressControl } from "../../keyboard/controls.ts";
import { focusRing } from "../../keyboard/focusRing.ts";
import { usePeriodCursor, usePeriodHasCursor } from "../../keyboard/KeyboardProvider.tsx";
import type { PeriodContext } from "../../keyboard/keymap.ts";
import type { PhraseSelection, WorkspaceBinding } from "./interfaces.ts";
import { MIN_GRAPH_HEIGHT } from "./slots.ts";
import { moodLocked } from "./functions/moodLocked.ts";
import { PeriodContainer, periodControls } from "./PeriodContainer/index.ts";
import { Resizer } from "./Resizer.tsx";
import { GRAPH_HEIGHT_KEY } from "./storageKeys.ts";

export interface PeriodCardProps {
  selection: PhraseSelection;
  // A period the console's line would make: drawn as a dashed card until ↵ (P02 §4).
  preview?: boolean;
  // The number the console's link list gives this period, worn on the card so a digit names it.
  consoleNumber?: number;
  // The workspace container's linking hooks; undefined for a standalone period.
  binding?: WorkspaceBinding;
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
  onToggleQuestion: () => void;
  // One more period, empty or loaded from the saved ones — the workspace's own two buttons, which
  // the period's N and L reach without leaving the card (see the keymap's period scope).
  onAddPeriod?: () => void;
  onLoadPeriod?: () => void;
  // The header controls, for the canvas to pack clear of in compact view.
  controlsRef?: Ref<HTMLDivElement>;
  // The full-view canvas height the card's bottom edge resizes.
  graphHeight: number;
  onGraphHeightChange: (height: number) => void;
  // Shown beside the card: the page's words panel.
  sidebar?: ReactNode;
  // The period's canvas.
  children: ReactNode;
}

// The card a period's canvas wears: the period's header and border controls, the canvas's resize
// grip, and — for a standalone period — the border drag that floats it about the viewport.
export function PeriodCard({
  selection,
  preview = false,
  consoleNumber,
  binding,
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
  onToggleQuestion,
  onAddPeriod,
  onLoadPeriod,
  controlsRef,
  graphHeight,
  onGraphHeightChange,
  sidebar,
  children,
}: PeriodCardProps) {
  // Where a standalone card has been dragged to by its border, in viewport pixels; null while it
  // sits in the page flow. The drag itself lives in PeriodContainer (useBorderDrag), but the state
  // is held here because this component's outer Box is what goes `fixed`.
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  // The Paper's padding, in theme spacing units. The resize grip negates it to sit flush
  // with the container's bottom border, so the two must stay in step.
  const paperPad = compact ? 1 : 2;
  // The clause-level connector controls on the card border, derived from the workspace binding
  // (undefined for a standalone period). See PeriodContainer/functions/periodControls.ts.
  const clauseControls = periodControls(binding, selection);
  const locked = moodLocked(binding);

  // What a key pressed on the card acts on: the very handlers its own controls call, published for
  // the one key listener in the app (see KeyboardProvider). Rebuilt every render, so a command
  // always runs against the period as it is now.
  const cardRef = useRef<HTMLDivElement | null>(null);
  const hasCursor = usePeriodHasCursor(cardRef.current);
  const cursor = usePeriodCursor((): PeriodContext => {
    const { conditional, coordinative, subordinate, instrumental } = clauseControls;
    return {
      id: binding?.containerId,
      selection,
      move: (delta) => (delta === -1 ? onMoveUp?.() : onMoveDown?.()),
      canMove: (delta) => Boolean(delta === -1 ? onMoveUp : onMoveDown),
      addPeriod: () => {
        onAddPeriod?.();
        // N leaves the cursor in the period it made, on the subject it opens on — the period is
        // appended to the stack, so it is the last card once the commit lands.
        requestAnimationFrame(() => {
          const stack = document.querySelectorAll<HTMLElement>("[data-kb-period]");
          const added = stack[stack.length - 1];
          added?.querySelector<HTMLElement>("[data-kb-box], input")?.focus();
        });
      },
      loadPeriod: () => onLoadPeriod?.(),
      save: onSave,
      remove: onRemove,
      hasContent,
      toggleImperative: onToggleImperative,
      toggleInfinitive: onToggleInfinitive,
      toggleQuestion: onToggleQuestion,
      moodLocked: locked,
      condition: conditional && {
        canStart: conditional.canStart,
        hasLink: conditional.hasCondition,
        start: conditional.onStart,
        clear: conditional.onClear,
      },
      coordination: coordinative && {
        canStart: coordinative.canStart,
        hasLink: coordinative.hasCoordination,
        // Starting a coordination asks for the conjunction first, from a menu that hangs off the
        // border control — so J presses that control rather than lifting its menu out of it.
        start: () => pressControl("coordinate", cardRef.current ?? document),
        clear: coordinative.onClear,
      },
      // The subordinate clause's menu hangs off its border control too, so U presses the control.
      subordination: subordinate && {
        canStart: subordinate.canStart && subordinate.options.length > 0,
        hasLink: Boolean(subordinate.asSource),
        start: () => pressControl("subordinate", cardRef.current ?? document),
        clear: subordinate.onClear,
      },
      // Only an instrument period carries a reification degree, and R walks the three in turn.
      cycleLevel:
        instrumental?.isInstrument && binding
          ? () => {
              const levels = ["process", "concept", "object"] as const;
              const at = levels.indexOf(instrumental.level);
              instrumental.onLevelChange(levels[(at + 1) % levels.length]!);
            }
          : undefined,
      // Only an instrument period can be denied (the privative, "without the knife"), and ⇧N flips it.
      togglePrivative:
        instrumental?.isInstrument && binding
          ? () => instrumental.onNegativeChange(!instrumental.negative)
          : undefined,
      // Only an infinitive whose governing clause has an object can be the object's, and O flips it (P13).
      toggleObjectControl: subordinate?.objectControl
        ? () => subordinate.objectControl!.onChange(!subordinate.objectControl!.object)
        : undefined,
      toggleCompact: onToggleCompact,
      tidy: onTidy,
      hasGroups,
      resize: (delta) =>
        onGraphHeightChange(Math.max(MIN_GRAPH_HEIGHT, graphHeight + delta)),
    };
  }, binding?.containerId);

  return (
    <Box
      data-testid="period-container"
      data-container-id={binding?.containerId}
      {...cursor}
      ref={cardRef}
      sx={[
        {
          position: position ? "fixed" : "relative",
          ...(position && { left: `${position.x}px`, top: `${position.y}px` }),
          zIndex: position ? 50 : "auto",
          // The cursor rests on the card itself, a level above its boxes: it wears the same ring
          // they do, drawn round the whole period.
          ...(hasCursor && { borderRadius: 1 }),
        },
        focusRing("primary"),
      ]}
    >
      <PeriodContainer
        preview={preview}
        consoleNumber={consoleNumber}
        paperPad={paperPad}
        compact={compact}
        showCanvas={showCanvas}
        hasGroups={hasGroups}
        hasContent={hasContent}
        soleContainer={soleContainer}
        // A workspace container stays in the managed stack so the cross-container
        // connectors measure correctly; only a standalone period may be floated.
        floatable={!binding}
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
        subordinate={clauseControls.subordinate}
        instrumental={clauseControls.instrumental}
        imperative={{ active: Boolean(selection.imperative), disabled: locked, onToggle: onToggleImperative }}
        infinitive={{ active: Boolean(selection.infinitive), disabled: locked, onToggle: onToggleInfinitive }}
        question={{ active: Boolean(selection.interrogative), disabled: locked, onToggle: onToggleQuestion }}
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
                localStorage.setItem(GRAPH_HEIGHT_KEY, String(Math.round(h)));
              }}
            />
          </Box>
        )}
      </PeriodContainer>

      {sidebar}
    </Box>
  );
}
