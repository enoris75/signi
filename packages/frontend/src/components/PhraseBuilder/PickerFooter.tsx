import { Box } from "@mui/material";
import type { UiStringKey } from "@signi/shared";
import { Keycap } from "../../keyboard/Keycap.tsx";
import { useInputModality } from "../../keyboard/KeyboardProvider.tsx";
import { useUiString } from "../../i18n/useUiString.ts";

/**
 * The strip along the foot of an open word picker, saying what its keys do (the plan's §3.5).
 *
 * Shown to a keyboard user only, like the key tips on the canvas: a mouse user's picker is the one
 * they have always seen. Each label is the catalogue's, lower-case as the strip reads.
 */

interface FooterKey {
  spec: string;
  label: string;
  labelKey?: UiStringKey;
}

// The keys every picker offers, and what each does. Read in the order a user meets them.
const LIST_KEYS: FooterKey[] = [
  { spec: "ArrowUp", label: "" },
  { spec: "ArrowDown", label: "move", labelKey: "action.move" },
  { spec: "Enter", label: "choose", labelKey: "slot.choose" },
  { spec: "Tab", label: "choose, and then go to the next slot", labelKey: "hint.chooseAndNext" },
  { spec: "Escape", label: "close", labelKey: "action.close" },
];

// The pronoun chooser is a grid, not a list, so it says its own keys.
const GRID_KEYS: FooterKey[] = [
  { spec: "1", label: "" },
  { spec: "4", label: "person", labelKey: "pronoun.person" },
  { spec: "ArrowUp", label: "" },
  { spec: "ArrowDown", label: "row", labelKey: "grid.row" },
  { spec: "ArrowLeft", label: "" },
  { spec: "ArrowRight", label: "value", labelKey: "grid.value" },
  // Selecting a pronoun is choosing it: the list's ↵ word.
  { spec: "Enter", label: "select", labelKey: "slot.choose" },
];

export function PickerFooter({ kind = "list" }: { kind?: "list" | "grid" }) {
  const modality = useInputModality();
  const t = useUiString();
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
      {(kind === "grid" ? GRID_KEYS : LIST_KEYS).map(({ spec, label, labelKey }) => (
        <Box
          key={spec}
          component="span"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.3 }}
        >
          <Keycap spec={spec} />
          {labelKey ? t(labelKey) : label}
        </Box>
      ))}
    </Box>
  );
}
