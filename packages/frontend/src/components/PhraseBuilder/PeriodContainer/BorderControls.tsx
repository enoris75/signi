import { Box } from "@mui/material";
import { ConditionalButton } from "./ConditionalButton.tsx";
import { CoordinationButton } from "./CoordinationButton.tsx";
import { MoodToggle } from "./MoodToggle.tsx";
import type { ClauseControls } from "./PeriodContainer.types.ts";

export type BorderControlsProps = Pick<
  ClauseControls,
  "conditional" | "coordinative" | "imperative" | "infinitive"
>;

// The clause-level controls stacked on the card's right border: the moods on top, then the
// conditional, then the coordinative. The conditional/coordinative connectors run from this
// cluster's registered anchor. A press on it never starts the card's border drag.
export function BorderControls({
  conditional,
  coordinative,
  imperative,
  infinitive,
}: BorderControlsProps) {
  if (!conditional && !coordinative && !imperative && !infinitive) return null;
  return (
    <Box
      ref={conditional?.registerBorderAnchor}
      data-testid="period-border-controls"
      onPointerDown={(e) => e.stopPropagation()}
      sx={{
        position: "absolute",
        right: -14,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 5,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      {imperative && <MoodToggle mood="imperative" control={imperative} />}
      {infinitive && <MoodToggle mood="infinitive" control={infinitive} />}
      {conditional && <ConditionalButton control={conditional} />}
      {coordinative && <CoordinationButton control={coordinative} />}
    </Box>
  );
}
