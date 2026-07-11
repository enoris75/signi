import { Box } from "@mui/material";
import type { RelConnector } from "./measure.ts";

// Connectors linking each noun to its relative-clause panel below the canvas. Painted over the
// whole builder (an absolutely-positioned, overflow-visible SVG spanning the root Box) so the
// line can bridge the gap between the canvas and the docked clause panels. Renders nothing when
// there are no connectors to draw.
export function RelativePhraseConnectors({
  connectors,
}: {
  connectors: RelConnector[];
}) {
  if (connectors.length === 0) return null;
  return (
    <Box
      component="svg"
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {connectors.map((c) => (
        <line
          key={c.which}
          x1={c.x1}
          y1={c.y1}
          x2={c.x2}
          y2={c.y2}
          stroke={c.color}
          strokeWidth="1.5"
          strokeOpacity="0.4"
          strokeDasharray="5 3"
        />
      ))}
    </Box>
  );
}
