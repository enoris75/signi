import { Box, Typography } from "@mui/material";
import { useId } from "react";
import { useUiString } from "../i18n/useUiString.ts";
import { COMMANDS, type CommandGroup } from "./language/commands.ts";
import { MONO, tokenColor } from "./tokens.tsx";

/**
 * The console's reference, in the help overlay beside the keys: every command, generated from the
 * catalogue the console itself reads — so it lists exactly what the console accepts, in the colour
 * each command's token wears.
 */

// English literals, for /localize.
const GROUPS: { group: CommandGroup; title: string; note?: string }[] = [
  { group: "role", title: "Roles", note: "take a word; alone they move the context" },
  { group: "noun", title: "On a noun" },
  { group: "verb", title: "On a verb" },
  { group: "adjective", title: "On an adjective" },
  { group: "period", title: "On a period" },
  { group: "workspace", title: "On the workspace" },
];

export function ConsoleHelp() {
  const t = useUiString();
  const headingId = useId();
  return (
    <Box component="section" aria-labelledby={headingId} sx={{ mt: 2 }}>
      {/* English literals, for /localize. */}
      <Typography id={headingId} variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        The phrase console
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", lineHeight: 1.6, mb: 2, maxWidth: 820 }}>
        A line is commands and their words, read left to right: a command attaches to the closest word
        before it that can take it, and the box under the cursor counts as the word just before the
        line. Settings set a value, so a line means the same whatever the period held. Brackets make
        a phrase where it belongs — <Box component="span" sx={{ fontFamily: MONO }}>/rel subj ( … )</Box>{" "}
        — and <Box component="span" sx={{ fontFamily: MONO }}>#2.obj</Box> names a noun of another
        period. ⇥ completes; ↑ brings back an earlier line.
      </Typography>
      <Box sx={{ columnCount: { xs: 1, md: 2, lg: 3 }, columnGap: 4, "& > *": { breakInside: "avoid" } }}>
        {GROUPS.map(({ group, title, note }) => (
          <Box key={group} sx={{ mb: 3 }} data-testid={`console-help-${group}`}>
            <Typography
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "primary.main",
              }}
            >
              {title}
            </Typography>
            {note && (
              <Typography sx={{ fontStyle: "italic", fontSize: "0.72rem", color: "text.secondary", mb: 0.5 }}>
                {note}
              </Typography>
            )}
            {COMMANDS.filter((c) => c.group === group).map((c) => (
              <Box key={c.name} sx={{ display: "flex", alignItems: "baseline", gap: 1.5, py: 0.3, fontSize: "0.82rem" }}>
                <Box
                  component="span"
                  sx={{ fontFamily: MONO, fontWeight: 500, minWidth: "7ch", color: tokenColor(c.color) }}
                >
                  /{c.name}
                </Box>
                <Box component="span" sx={{ flex: 1 }}>
                  {c.descriptionKey ? t(c.descriptionKey) : c.description}
                </Box>
                {c.aliases.length > 0 && (
                  <Box component="span" sx={{ fontFamily: MONO, fontSize: "0.72rem", color: "text.disabled" }}>
                    {c.aliases.map((a) => `/${a}`).join(" ")}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
