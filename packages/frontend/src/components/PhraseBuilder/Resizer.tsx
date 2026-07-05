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

// A thin horizontal strip below the canvas; dragging it vertically resizes the
// canvas. Listens on window so the drag survives the pointer leaving the strip.
export function Resizer({
  height,
  minHeight,
  onResize,
  onResizeEnd,
}: ResizerProps) {
  return (
    <Box
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
        height: 6,
        cursor: "ns-resize",
        touchAction: "none",
        borderTop: "1px solid",
        borderColor: "divider",
        opacity: 0.4,
        transition: "opacity 0.15s",
        "&:hover": { opacity: 1, borderColor: "primary.main" },
      }}
    />
  );
}
