import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";
import type { Concept } from "@signi/shared";
import { AdjectiveTypeahead } from "./AdjectiveTypeahead.tsx";
import { DirectObjectTypeahead } from "./DirectObjectTypeahead.tsx";

/**
 * A picker that switches between the adjective and the noun vocabulary. Used by every
 * adjective slot — a real adjective ("big") or a noun used attributively ("sail" → "sail
 * boat") — and by the subject complement, whose head is a predicate noun ("becomes a
 * legend") or a predicate adjective ("seems happy"). The picked concept's `role` is what
 * downstream code reads to tell the two apart; this toggle only chooses which vocabulary
 * is searched.
 */
export function ModifierTypeahead({
  onSelect,
  defaultKind = "adjective",
}: {
  onSelect: (concept: Concept) => void;
  defaultKind?: "adjective" | "noun";
}) {
  const [kind, setKind] = useState<"adjective" | "noun">(defaultKind);
  return (
    <Box onPointerDown={(e) => e.stopPropagation()}>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={kind}
        onChange={(_, v) => v && setKind(v)}
        sx={{
          mb: 0.5,
          "& .MuiToggleButton-root": {
            px: 0.75,
            py: 0.1,
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.55rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1.4,
            border: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <ToggleButton value="adjective">Adj</ToggleButton>
        <ToggleButton value="noun">Noun</ToggleButton>
      </ToggleButtonGroup>
      {kind === "adjective" ? (
        <AdjectiveTypeahead onSelect={onSelect} />
      ) : (
        <DirectObjectTypeahead onSelect={onSelect} />
      )}
    </Box>
  );
}
