import { Box } from "@mui/material";

interface ResizerProps {
  // Current canvas height in px — the drag baseline.
  height: number;
  // Lower bound the drag clamps to.
  minHeight: number;
  // Called with the new height on every pointer move during the drag.
  onResize: (height: number) => void;
  // Called once with the final height when the drag ends (e.g. to persist it).
  onResizeEnd?: (height: number) => void;
}

// How far one arrow-key press moves the edge.
const KEY_STEP = 16;

// The period container's bottom edge: a grab bar carrying a centred grip. Dragging it
// vertically resizes the canvas above. Listens on window so the drag survives the
// pointer leaving the bar. Rendered flush with the container's bottom border, so the
// caller bleeds it through the container's padding.
export function Resizer({
  height,
  minHeight,
  onResize,
  onResizeEnd,
}: ResizerProps) {
  function nudge(delta: number) {
    const next = Math.max(minHeight, height + delta);
    onResize(next);
    onResizeEnd?.(next);
  }

  return (
    <Box
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize period container"
      title="Drag to resize"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          nudge(KEY_STEP);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          nudge(-KEY_STEP);
        }
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        const startY = e.clientY;
        const startH = height;
        let currentH = startH;
        const onMove = (ev: PointerEvent) => {
          currentH = Math.max(minHeight, startH + (ev.clientY - startY));
          onResize(currentH);
        };
        const onUp = () => {
          onResizeEnd?.(currentH);
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          window.removeEventListener("pointercancel", onUp);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 12,
        cursor: "ns-resize",
        touchAction: "none",
        outline: "none",
        borderTop: "1px solid",
        borderColor: "divider",
        borderRadius: "0 0 3px 3px",
        bgcolor: "action.hover",
        transition: "background-color 0.15s",
        "&:hover, &:focus-visible": {
          bgcolor: "action.selected",
          borderColor: "primary.main",
          "& .resizer-grip": { bgcolor: "primary.main" },
        },
      }}
    >
      <Box
        className="resizer-grip"
        sx={{
          width: 36,
          height: 3,
          borderRadius: 1.5,
          bgcolor: "text.disabled",
          transition: "background-color 0.15s",
        }}
      />
    </Box>
  );
}
