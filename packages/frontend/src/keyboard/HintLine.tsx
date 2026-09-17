import { Box } from "@mui/material";
import { ALL_SLOTS } from "../components/PhraseBuilder/slots.ts";
import { useConceptLabel } from "../i18n/useConceptLabel.ts";
import { useUiString } from "../i18n/useUiString.ts";
import { hintsFor, KEYMAP, PERIOD_KEYMAP } from "./keymap.ts";
import { Keycap } from "./Keycap.tsx";
import { useCursorContext, useInputModality } from "./KeyboardProvider.tsx";

/**
 * A strip docked at the foot of the page saying what the keys do *here*: the box the cursor is on,
 * and the keys its scopes offer, read straight from the keymap so it can never list a key that is
 * not bound or miss one that is.
 *
 * It is shown to a keyboard user only. When P02's console arrives this is the right-hand side of
 * its prompt line; until then it stands on its own (the plan's §3.2).
 */
export function HintLine() {
  const modality = useInputModality();
  const cursor = useCursorContext();
  const t = useUiString();
  const word = useConceptLabel();

  if (modality !== "keyboard" || !cursor) return null;

  // What the cursor is on, and the keys that apply there: a word box says its slot and its word,
  // and the period a level above it says so — both read off the keymap for the level.
  const slot = cursor.box && ALL_SLOTS.find((s) => s.key === cursor.box!.slot);
  const held = cursor.box?.selection[cursor.box.slot];
  const hints = cursor.box
    ? hintsFor(KEYMAP, cursor.scopes, cursor.box)
    : hintsFor(PERIOD_KEYMAP, cursor.scopes, cursor.period);
  const where = slot?.labelKey
    ? t(slot.labelKey)
    : (slot?.label ?? (cursor.box ? cursor.box.slot : t("clause.main")));

  return (
    <>
      {/* The strip is fixed to the foot of the window, so the page keeps room for it rather than
          ending underneath it. */}
      <Box sx={{ height: 34 }} aria-hidden />
      <Box
        data-testid="hint-line"
        // A running commentary on where the cursor is would be noise read aloud; a screen-reader
        // user has each box's own name and each control's shortcut instead.
        aria-hidden
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (theme) => theme.zIndex.drawer + 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          py: 0.75,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.68rem",
          color: "text.secondary",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
          <Box
            component="span"
            sx={{ fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}
          >
            {where}
          </Box>
          {held && (
            <Box
              component="span"
              sx={{ fontFamily: '"Lora", Georgia, serif', fontStyle: "italic", color: "text.primary" }}
            >
              {word(held)}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.25,
            ml: "auto",
            justifyContent: "flex-end",
          }}
        >
          {hints.map((command) => (
            <Box
              key={command.id}
              component="span"
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.4 }}
            >
              <Keycap spec={command.keys[0]} />
              {command.labelKey ? t(command.labelKey) : command.label}
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}
