import { Box, Button } from "@mui/material";
import { commandNamed } from "./language/commands.ts";
import { MONO } from "./tokens.tsx";
import { useUiString } from "../i18n/useUiString.ts";
import type { PhraseConsoleModel } from "./usePhraseConsole.ts";

/**
 * The console's command bar (P17 phase 4): a row of keys above the soft keyboard, for the ones it
 * buries — Tab, the console's own completing key, and the punctuation a phone's keyboard hides
 * behind a second layer (`/`, `(`). `/adj`, `/pl` and `/not` are there whole, so composing them is
 * one tap, not a hunt for the slash and then the letters.
 *
 * Each button holds the prompt's focus rather than taking it: a tap that blurred the field would
 * drop the soft keyboard from under the bar that is supposed to sit above it. `insertToken` (the
 * model) does what a keystroke does — the same structuring, the same auto-opened bracket — and
 * always places the caret itself, since nothing here is a real keystroke for the browser to move it.
 */
export function ConsoleCommandBar({ model }: { model: PhraseConsoleModel }) {
  const t = useUiString();
  const hold = (e: React.PointerEvent) => e.preventDefault();
  const label = (name: string) => {
    const key = commandNamed(name)?.descriptionKey;
    return key ? t(key) : name;
  };
  const keySx = {
    minWidth: 44,
    minHeight: 44,
    flexShrink: 0,
    fontFamily: MONO,
    fontSize: "0.85rem",
    textTransform: "none",
    color: "text.secondary",
  } as const;

  return (
    <Box
      data-testid="console-command-bar"
      sx={{
        display: "flex",
        gap: 0.5,
        px: 1,
        py: 0.5,
        overflowX: "auto",
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Button data-testid="command-bar-tab" aria-label={t("console.nextWord")} onPointerDown={hold} onClick={() => model.tab()} sx={keySx}>
        ⇥
      </Button>
      <Button
        data-testid="command-bar-adj"
        aria-label={label("adj")}
        onPointerDown={hold}
        onClick={() => model.insertToken("/adj ")}
        sx={keySx}
      >
        /adj
      </Button>
      <Button
        data-testid="command-bar-pl"
        aria-label={label("pl")}
        onPointerDown={hold}
        onClick={() => model.insertToken("/pl ")}
        sx={keySx}
      >
        /pl
      </Button>
      <Button
        data-testid="command-bar-not"
        aria-label={label("not")}
        onPointerDown={hold}
        onClick={() => model.insertToken("/not ")}
        sx={keySx}
      >
        /not
      </Button>
      <Button data-testid="command-bar-slash" aria-label="/" onPointerDown={hold} onClick={() => model.insertToken("/")} sx={keySx}>
        /
      </Button>
      <Button data-testid="command-bar-bracket" aria-label="( )" onPointerDown={hold} onClick={() => model.insertToken("(")} sx={keySx}>
        ( )
      </Button>
      <Button
        data-testid="command-bar-run"
        aria-label={t("action.apply")}
        onPointerDown={hold}
        onClick={() => model.commit()}
        sx={{ ...keySx, ml: "auto", color: "primary.main", fontWeight: 700 }}
      >
        ↵
      </Button>
    </Box>
  );
}
