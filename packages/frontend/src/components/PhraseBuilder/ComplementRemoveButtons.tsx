import { Tooltip, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import type { ComplementType } from "@signi/shared";
import type { GroupRect } from "./graph.ts";

// The small "x" on each complement dotted box's top-right corner that removes the
// whole complement. Only group rects carrying a `removeKey` (the complements) get one.
export function ComplementRemoveButtons({
  groupRects,
  onRemove,
}: {
  groupRects: GroupRect[];
  onRemove: (type: ComplementType) => void;
}) {
  return (
    <>
      {groupRects
        .filter((g) => g.removeKey)
        .map((g) => (
          <Tooltip key={`remove-${g.removeKey}`} title={`Remove ${g.label}`}>
            <IconButton
              size="small"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onRemove(g.removeKey!)}
              sx={{
                position: "absolute",
                left: g.x + g.width - 9,
                top: g.y - 9,
                width: 18,
                height: 18,
                p: 0,
                zIndex: 3,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                opacity: 0.7,
                "&:hover": {
                  opacity: 1,
                  bgcolor: "background.paper",
                },
              }}
            >
              <ClearIcon sx={{ fontSize: 11 }} />
            </IconButton>
          </Tooltip>
        ))}
    </>
  );
}
