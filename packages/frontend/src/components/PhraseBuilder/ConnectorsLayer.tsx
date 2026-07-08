import { Box } from "@mui/material";
import type { Edge } from "./graph.ts";

// The SVG layer behind everything: the solid group-to-group links (constituent
// dashed box ↔ verb phrase) and the faint dashed satellite/adjective links. The
// dashed group boxes themselves are drawn by each Noun/VerbPhraseBuilder now, so
// this layer only paints the connecting lines.
export function ConnectorsLayer({
  svgSize,
  groupEdges,
  edges,
}: {
  svgSize: { w: number; h: number };
  groupEdges: Edge[];
  edges: Edge[];
}) {
  return (
    <Box
      component="svg"
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
      viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
    >
      {groupEdges.map((edge, i) => (
        <line
          key={`group-${i}`}
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          stroke={edge.color}
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />
      ))}
      {edges.map((edge, i) => (
        <g key={i}>
          <line
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke={edge.color}
            strokeWidth="1"
            strokeOpacity="0.25"
            strokeDasharray="4 3"
          />
          {/* Dot on the satellite end of the connector. */}
          <circle
            cx={edge.x2}
            cy={edge.y2}
            r="2"
            fill={edge.color}
            fillOpacity="0.4"
          />
        </g>
      ))}
    </Box>
  );
}
