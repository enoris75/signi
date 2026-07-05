import React from "react";
import { Box } from "@mui/material";
import { SatelliteButton, type SatelliteIcon } from "./Boxes.tsx";
import { ALL_SLOTS } from "./slots.ts";

interface SatelliteControlsProps {
  // Satellite reveal icons grouped by the core box (slot key) they ride.
  satelliteIconsByParent: Record<string, SatelliteIcon[]>;
  // Absolute canvas-pixel position for each icon, keyed by satellite key.
  controlPos: Record<string, { x: number; y: number }>;
}

// Satellite reveal controls — each pinned to its core box's border facing the
// satellite it governs (see controlPos), so the connector starts from the
// control. Complement toggles are excluded here; they ride the Verb Phrase
// dotted box.
export function SatelliteControls({
  satelliteIconsByParent,
  controlPos,
}: SatelliteControlsProps) {
  return (
    <>
      {Object.entries(satelliteIconsByParent).flatMap(([parentKey, icons]) => {
        const color =
          ALL_SLOTS.find((s) => s.key === parentKey)?.color ?? "primary";
        return icons.map((icon) => {
          const p = controlPos[icon.key];
          if (!p) return null;
          return (
            <Box
              key={icon.key}
              sx={{
                position: "absolute",
                left: p.x,
                top: p.y,
                transform: "translate(-50%, -50%)",
                zIndex: 2,
              }}
            >
              <SatelliteButton sat={icon} color={color} />
            </Box>
          );
        });
      })}
    </>
  );
}
