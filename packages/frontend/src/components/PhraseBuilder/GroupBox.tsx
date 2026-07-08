import { Box, Tooltip, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import type { GroupRect } from "./graph.ts";
import type { PhraseRenderContext } from "./phraseRender.tsx";

// The dashed bounding box for one role group — the subject, verb phrase, an
// object, or a motion complement — painted behind that constituent's word boxes.
// The box is draggable (moving every child node at once) and carries the
// collapse/expand toggle on its top-left corner plus, for complements, the
// remove "x" on its top-right corner. Rendered by each Noun/VerbPhraseBuilder for
// its own group instead of as a separate overlay.
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
    draggingKey,
    makeGroupDragProps,
    handleToggleCollapse,
    handleRearrangeGroup,
    handleRemoveComplement,
  } = ctx;
  // Compact view hides the dashed boxes entirely — only the core-word chips remain.
  if (compact) return null;
  const isCollapsed = collapsedGroups[rect.label] ?? false;
  // Only worth tidying when there's more than the main word to arrange, and not
  // while collapsed (the satellites are hidden).
  const canRearrange = !isCollapsed && rect.nodeKeys.length > 1;

  return (
    <>
      {/* The dashed box itself sits behind the word boxes (zIndex 0) and captures
          drags over its empty area. */}
      <Box
        {...makeGroupDragProps(rect.nodeKeys)}
        sx={{
          position: "absolute",
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
          border: "1px dashed",
          borderColor: rect.color,
          borderRadius: "4px",
          opacity: 0.45,
          zIndex: 0,
          touchAction: "none",
          cursor: draggingKey === "__group__" ? "grabbing" : "grab",
        }}
      />

      {/* Collapse/expand control on the top-left corner. */}
      <Tooltip title={`${isCollapsed ? "Expand" : "Collapse"} ${rect.label}`}>
        <IconButton
          size="small"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => handleToggleCollapse(rect.label)}
          sx={{
            position: "absolute",
            left: rect.x - 9,
            top: rect.y - 9,
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
          {isCollapsed ? (
            <UnfoldMoreIcon sx={{ fontSize: 12 }} />
          ) : (
            <UnfoldLessIcon sx={{ fontSize: 12 }} />
          )}
        </IconButton>
      </Tooltip>

      {/* Re-arrange / compact control, just right of the collapse toggle. */}
      {canRearrange && (
        <Tooltip title={`Tidy up ${rect.label}`}>
          <IconButton
            size="small"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => handleRearrangeGroup(rect.nodeKeys)}
            sx={{
              position: "absolute",
              left: rect.x + 11,
              top: rect.y - 9,
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
            <AutoFixHighIcon sx={{ fontSize: 11 }} />
          </IconButton>
        </Tooltip>
      )}

      {/* Remove "x" on the top-right corner — complements only. */}
      {rect.removeKey && (
        <Tooltip title={`Remove ${rect.label}`}>
          <IconButton
            size="small"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => handleRemoveComplement(rect.removeKey!)}
            sx={{
              position: "absolute",
              left: rect.x + rect.width - 9,
              top: rect.y - 9,
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
            <ClearIcon sx={{ fontSize: 11 }} />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}
