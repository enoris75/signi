import { Box } from "@mui/material";
import type { Edge } from "./graph.ts";

// The SVG layer behind everything: the solid links between constituents (verb phrase ↔ each
// other constituent, port to port on their dotted rings) and the faint dashed links from each
// satellite's reveal control to its disc. The rings themselves are drawn by each
// Noun/VerbPhraseBuilder, so this layer only paints the connecting lines.
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
        <g key={`group-${i}`} data-link="group">
          {edge.via ? (
            // A pointed-to owner's line bows past the rings between its ends, dashed: it points to a
            // noun rather than joining a constituent.
            <path
              d={`M ${edge.x1} ${edge.y1} Q ${edge.via.x} ${edge.via.y} ${edge.x2} ${edge.y2}`}
              fill="none"
              stroke={edge.color}
              strokeWidth="1.5"
              strokeOpacity="0.4"
              strokeDasharray={edge.dashed ? "6 4" : undefined}
            />
          ) : (
            <line
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke={edge.color}
              strokeWidth="1.5"
              strokeOpacity="0.4"
              strokeDasharray={edge.dashed ? "6 4" : undefined}
            />
          )}
          {/* The ports the link joins, on each dotted ring. */}
          <circle cx={edge.x1} cy={edge.y1} r="3" fill={edge.color} fillOpacity="0.6" />
          <circle cx={edge.x2} cy={edge.y2} r="3" fill={edge.color} fillOpacity="0.6" />
        </g>
      ))}
      {edges.map((edge, i) => (
        <g key={i} data-link="satellite">
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
