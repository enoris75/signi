import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";
import type { Concept } from "@signi/shared";
import { AdjectiveTypeahead } from "./AdjectiveTypeahead.tsx";
import { DirectObjectTypeahead } from "./DirectObjectTypeahead.tsx";

/**
 * The empty-slot picker for an adjective slot, with a switch between a real adjective
 * ("big") and a noun used attributively ("sail" → "sail boat"). The picked concept's
 * `role` is what downstream code (selectionToPlan) reads to route it into `adjectives`
 * vs `nounModifiers`; this toggle only chooses which vocabulary is searched.
 */
export function ModifierTypeahead({ onSelect }: { onSelect: (concept: Concept) => void }) {
  const [kind, setKind] = useState<"adjective" | "noun">("adjective");
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
