import React from "react";
import { Box } from "@mui/material";
import type { Edge, GroupRect } from "./graph.ts";

// The SVG layer behind the draggable boxes: the dashed role-group bounding rects
// (themselves draggable, moving all their child nodes), the solid group-to-group
// links, and the faint dashed satellite/adjective links.
export function PhraseGraphLayer({
  svgSize,
  groupRects,
  groupEdges,
  edges,
  draggingKey,
  onGroupDragStart,
  onDragMove,
  onDragEnd,
}: {
  svgSize: { w: number; h: number };
  groupRects: GroupRect[];
  groupEdges: Edge[];
  edges: Edge[];
  draggingKey: string | null;
  onGroupDragStart: (
    e: React.PointerEvent<SVGRectElement>,
    nodeKeys: string[],
  ) => void;
  onDragMove: (e: React.PointerEvent) => void;
  onDragEnd: () => void;
}) {
  return (
    <Box
      component="svg"
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
      viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
    >
      {groupRects.map((g) => (
        <rect
          key={g.label}
          x={g.x}
          y={g.y}
          width={g.width}
          height={g.height}
          rx="4"
          ry="4"
          fill="rgba(0,0,0,0.001)"
          stroke={g.color}
          strokeWidth="1"
          strokeOpacity="0.45"
          strokeDasharray="8 5"
          style={{
            cursor: draggingKey === "__group__" ? "grabbing" : "grab",
          }}
          onPointerDown={(e) => onGroupDragStart(e, g.nodeKeys)}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        />
      ))}
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
          style={{ pointerEvents: "none" }}
        />
      ))}
      {edges.map((edge, i) => (
        <line
          key={i}
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          stroke={edge.color}
          strokeWidth="1"
          strokeOpacity="0.25"
          strokeDasharray="4 3"
          style={{ pointerEvents: "none" }}
        />
      ))}
    </Box>
  );
}
