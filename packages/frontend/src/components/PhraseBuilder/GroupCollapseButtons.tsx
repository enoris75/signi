import { Tooltip, IconButton } from "@mui/material";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import type { GroupRect } from "./graph.ts";

// The small collapse/expand control on each dotted role-group box's top-left
// corner. Collapsing hides every satellite (adjectives, number/gender, adverb,
// polarity) so the box shows only its main word; expanding restores them.
export function GroupCollapseButtons({
  groupRects,
  collapsed,
  onToggle,
}: {
  groupRects: GroupRect[];
  collapsed: Record<string, boolean>;
  onToggle: (label: string) => void;
}) {
  return (
    <>
      {groupRects.map((g) => {
        const isCollapsed = collapsed[g.label] ?? false;
        return (
          <Tooltip
            key={`collapse-${g.label}`}
            title={`${isCollapsed ? "Expand" : "Collapse"} ${g.label}`}
          >
            <IconButton
              size="small"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onToggle(g.label)}
              sx={{
                position: "absolute",
                left: g.x - 9,
                top: g.y - 9,
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
        );
      })}
    </>
  );
}
