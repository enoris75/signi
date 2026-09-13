import { Box } from "@mui/material";
import { ClearButton, SatelliteButton, type SatelliteIcon } from "./Boxes.tsx";
import { clearControlKey } from "./ringSpecs.ts";
import { ALL_SLOTS } from "./slots.ts";

interface SatelliteControlsProps {
  // Satellite reveal icons grouped by the node (slot key) that carries them: a constituent's word,
  // or — for a chained satellite — the satellite before it in the chain.
  satelliteIconsByParent: Record<string, SatelliteIcon[]>;
  // The words whose solid ring carries a clear button.
  clearControls: { mainKey: string; label: string; onClear: () => void }[];
  // Where every ring control sits on the canvas, keyed by control.
  controlPos: Record<string, { x: number; y: number }>;
}

// The controls about the words: each satellite's reveal control and each direct toggle on its
// word's solid ring — facing the satellite it governs, so its connector starts from the control —
// the controls for chained satellites in the orbit gaps between their discs, and each word's clear
// button. The ring layout seats them all (see ringSpecs). Complement toggles are not here: they ride
// the verb phrase's dotted ring.
export function SatelliteControls({
  satelliteIconsByParent,
  clearControls,
  controlPos,
}: SatelliteControlsProps) {
  const seat = (p: { x: number; y: number }) =>
    ({
      position: "absolute",
      left: p.x,
      top: p.y,
      transform: "translate(-50%, -50%)",
      zIndex: 2,
    }) as const;
  return (
    <>
      {Object.entries(satelliteIconsByParent).flatMap(([parentKey, icons]) => {
        const color = ALL_SLOTS.find((s) => s.key === parentKey)?.color ?? "primary";
        return icons.map((icon) => {
          const p = controlPos[icon.key];
          if (!p) return null;
          return (
            <Box key={icon.key} sx={seat(p)}>
              <SatelliteButton sat={icon} color={color} />
            </Box>
          );
        });
      })}
      {clearControls.map(({ mainKey, label, onClear }) => {
        const p = controlPos[clearControlKey(mainKey)];
        if (!p) return null;
        return <ClearButton key={mainKey} label={label} onClear={onClear} sx={seat(p)} />;
      })}
    </>
  );
}
