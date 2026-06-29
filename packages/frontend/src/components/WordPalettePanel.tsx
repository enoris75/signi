import { Paper, Typography, Divider } from "@mui/material";
import type { Concept, GrammaticalRole, Transitivity } from "@signi/shared";
import ConceptPalette from "./ConceptPalette.tsx";
import { getActiveSlots } from "./PhraseBuilder/PhraseBuilder.tsx";
import { type SlotConfig } from "./PhraseBuilder/interfaces.ts";

interface Props {
  activeSlot: SlotConfig | null;
  verbTransitivity?: Transitivity;
  selection: Record<string, Concept | undefined>;
  onSelect: (concept: Concept) => void;
}

export default function WordPalettePanel({
  activeSlot,
  verbTransitivity,
  selection,
  onSelect,
}: Props) {
  if (activeSlot) {
    return (
      <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          Choose a word for: <em>{activeSlot.label}</em>
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 2, display: "block" }}
        >
          {activeSlot.required ? "Required" : "Optional"} · accepted roles:{" "}
          {activeSlot.roles.join(", ")}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {activeSlot.roles.map((role: GrammaticalRole) => (
          <ConceptPalette
            key={role}
            role={role}
            onSelect={onSelect}
            selectedId={selection[activeSlot.key]?.id}
          />
        ))}
      </Paper>
    );
  }

  const slots = getActiveSlots(verbTransitivity);
  return (
    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        All Words
      </Typography>
      {slots.map((slot) =>
        slot.roles.map((role: GrammaticalRole) => (
          <ConceptPalette
            key={`${slot.key}-${role}`}
            role={role}
            onSelect={onSelect}
            selectedId={selection[slot.key]?.id}
          />
        )),
      )}
    </Paper>
  );
}
