import { Box } from "@mui/material";
import { Keycap } from "../../keyboard/Keycap.tsx";
import { useInputModality } from "../../keyboard/KeyboardProvider.tsx";

/**
 * The strip along the foot of an open word picker, saying what its keys do (the plan's §3.5).
 *
 * Shown to a keyboard user only, like the key tips on the canvas: a mouse user's picker is the one
 * they have always seen. The labels are English literals for now — they are new strings, and the
 * catalogue renders every string from a seeded period, so they are marked for `/localize` rather
 * than invented here.
 */

// The keys every picker offers, and what each does. Read in the order a user meets them.
const LIST_KEYS: { spec: string; label: string }[] = [
  { spec: "ArrowUp", label: "" },
  { spec: "ArrowDown", label: "move" },
  { spec: "Enter", label: "choose" },
  { spec: "Tab", label: "choose, next box" },
  { spec: "Escape", label: "close" },
];

// The pronoun chooser is a grid, not a list, so it says its own keys.
const GRID_KEYS: { spec: string; label: string }[] = [
  { spec: "1", label: "" },
  { spec: "4", label: "person" },
  { spec: "ArrowUp", label: "" },
  { spec: "ArrowDown", label: "row" },
  { spec: "ArrowLeft", label: "" },
  { spec: "ArrowRight", label: "value" },
  { spec: "Enter", label: "select" },
];

export function PickerFooter({ kind = "list" }: { kind?: "list" | "grid" }) {
  const modality = useInputModality();
  if (modality !== "keyboard") return null;
  return (
    <Box
      data-testid={`picker-footer-${kind}`}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 0.75,
        px: 1,
        py: 0.5,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
        fontFamily: '"Inter", sans-serif',
        fontSize: "0.62rem",
        color: "text.secondary",
      }}
    >
      {(kind === "grid" ? GRID_KEYS : LIST_KEYS).map(({ spec, label }) => (
        <Box
          key={spec}
          component="span"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.3 }}
        >
          <Keycap spec={spec} />
          {label}
        </Box>
      ))}
    </Box>
  );
}
