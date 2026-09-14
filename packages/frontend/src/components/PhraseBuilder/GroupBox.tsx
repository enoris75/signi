import { Box, Tooltip, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import type { ReactNode } from "react";
import type { GroupRect } from "./graph.ts";
import type { PhraseRenderContext } from "./phraseRender.tsx";
import { collapseControlKey, removeControlKey } from "./ringSpecs.ts";
import { collapseTitle, removeTitle } from "./canvasCommands.ts";
import { useUiString } from "../../i18n/useUiString.ts";

// A small round chrome button on the dotted ring, centred where the ring layout seats it.
function RingButton({
  at,
  title,
  onClick,
  children,
}: {
  at: { x: number; y: number } | undefined;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  if (!at) return null;
  return (
    <Tooltip title={title}>
      <IconButton
        size="small"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onClick}
        sx={{
          position: "absolute",
          left: at.x,
          top: at.y,
          transform: "translate(-50%, -50%)",
          width: 18,
          height: 18,
          p: 0,
          zIndex: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          opacity: 0.7,
          "&:hover": { opacity: 1, bgcolor: "background.paper" },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

// The dotted ring round one constituent — the subject, verb phrase, an object, or a complement —
// painted behind its word and satellites. The ring is draggable (moving the whole constituent) and
// carries the collapse/expand toggle and, for complements and conjuncts, the remove button, both
// seated on it by the ring layout among the ring's other controls. Rendered by each
// Noun/VerbPhraseBuilder for its own constituent.
export function GroupBox({
  rect,
  ctx,
}: {
  rect: GroupRect;
  ctx: PhraseRenderContext;
}) {
  const {
    collapsedGroups,
    compact,
    controlPos,
    draggingKey,
    makeGroupDragProps,
    handleToggleCollapse,
    handleRemoveComplement,
    removeRing,
  } = ctx;
  const t = useUiString();
  // Compact view hides the dotted rings entirely — only the words in their solid rings remain.
  if (compact) return null;
  const isCollapsed = collapsedGroups[rect.label] ?? false;

  return (
    <>
      {/* The ring itself sits behind the word and its satellites (zIndex 0) and captures drags
          over its empty area. */}
      <Box
        {...makeGroupDragProps([rect.mainKey])}
        data-testid="group-box"
        data-group={rect.label}
        sx={{
          position: "absolute",
          left: rect.center.x - rect.rOut,
          top: rect.center.y - rect.rOut,
          width: 2 * rect.rOut,
          height: 2 * rect.rOut,
          boxSizing: "border-box",
          border: "1px dashed",
          borderColor: rect.color,
          borderRadius: "50%",
          opacity: 0.45,
          zIndex: 0,
          touchAction: "none",
          cursor: draggingKey === "__group__" ? "grabbing" : "grab",
        }}
      />

      <RingButton
        at={controlPos[collapseControlKey(rect.label)]}
        title={collapseTitle(t, isCollapsed, rect.label, rect.labelKey)}
        onClick={() => handleToggleCollapse(rect.label)}
      >
        {isCollapsed ? <UnfoldMoreIcon sx={{ fontSize: 12 }} /> : <UnfoldLessIcon sx={{ fontSize: 12 }} />}
      </RingButton>

      {rect.removeKey && (
        <RingButton
          at={controlPos[removeControlKey(rect.label)]}
          title={removeTitle(t, rect.label, rect.labelKey)}
          onClick={() => handleRemoveComplement(rect.removeKey!)}
        >
          <ClearIcon sx={{ fontSize: 11 }} />
        </RingButton>
      )}

      {/* A hosted ring drops its phrase: a conjunct out of its group, an owner off its noun. */}
      {rect.removable && removeRing && (
        <RingButton
          at={controlPos[removeControlKey(rect.label)]}
          title={removeRing.title}
          onClick={removeRing.onRemove}
        >
          <ClearIcon sx={{ fontSize: 11 }} />
        </RingButton>
      )}
    </>
  );
}
