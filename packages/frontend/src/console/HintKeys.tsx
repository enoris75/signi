import { Box } from "@mui/material";
import { commandLabel, hintsFor, KEYMAP, PERIOD_KEYMAP } from "../keyboard/keymap.ts";
import { Keycap } from "../keyboard/Keycap.tsx";
import { useCursorContext, useInputModality } from "../keyboard/KeyboardProvider.tsx";
import { useUiString } from "../i18n/useUiString.ts";

/**
 * The keys of whatever the canvas cursor is on — a box, or the period a level above it — read
 * straight from the keymap, so they can never list a key that is not bound or miss one that is. Shown
 * to a keyboard user only. It is P01's hint line; the console's prompt line carries it while the
 * keyboard is on the canvas.
 */
export function HintKeys() {
  const modality = useInputModality();
  const cursor = useCursorContext();
  const t = useUiString();
  if (modality !== "keyboard" || !cursor) return null;
  const hints = cursor.box
    ? hintsFor(KEYMAP, cursor.scopes, cursor.box)
    : hintsFor(PERIOD_KEYMAP, cursor.scopes, cursor.period);
  return (
    <Box
      // The hint line: while the console is shown, its prompt line is where the hints are.
      data-testid="hint-line"
      aria-hidden
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1.25,
        ml: "auto",
        justifyContent: "flex-end",
        fontFamily: '"Inter", sans-serif',
        fontSize: "0.68rem",
        color: "text.secondary",
      }}
    >
      {hints.map((command) => (
        <Box key={command.id} component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.4 }}>
          <Keycap spec={command.keys[0]!} />
          {commandLabel(command, t)}
        </Box>
      ))}
    </Box>
  );
}
