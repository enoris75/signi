import { Box } from "@mui/material";
import { ConditionalButton } from "./ConditionalButton.tsx";
import { CoordinationButton } from "./CoordinationButton.tsx";
import { SubordinateButton } from "./SubordinateButton.tsx";
import { MoodToggle } from "./MoodToggle.tsx";
import { InterjectionToggle } from "./InterjectionToggle.tsx";
import { VocativeToggle } from "./VocativeToggle.tsx";
import type { ClauseControls } from "./PeriodContainer.types.ts";

export type BorderControlsProps = Pick<
  ClauseControls,
  "conditional" | "coordinative" | "subordinate" | "imperative" | "infinitive" | "question" | "interjection" | "vocative"
>;

// The clause-level controls stacked on the card's right border: the moods on top, then the
// conditional, then the coordinative, then the subordinate clause, then the interjection (P09-E47) and
// last the vocative (P11-E8) — the two spoken before the clause, in the order they are spoken.
// The conditional/coordinative connectors run from this
// cluster's registered anchor. A press on it never starts the card's border drag.
export function BorderControls({
  conditional,
  coordinative,
  subordinate,
  imperative,
  infinitive,
  question,
  interjection,
  vocative,
}: BorderControlsProps) {
  if (!conditional && !coordinative && !subordinate && !imperative && !infinitive && !question && !interjection && !vocative)
    return null;
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
      {question && <MoodToggle mood="question" control={question} />}
      {conditional && <ConditionalButton control={conditional} />}
      {coordinative && <CoordinationButton control={coordinative} />}
      {subordinate && <SubordinateButton control={subordinate} />}
      {interjection && <InterjectionToggle control={interjection} />}
      {vocative && <VocativeToggle control={vocative} />}
    </Box>
  );
}
