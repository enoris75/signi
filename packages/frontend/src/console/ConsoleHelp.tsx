import { Box, Typography } from "@mui/material";
import { useId } from "react";
import { useUiString } from "../i18n/useUiString.ts";
import { COMMANDS, TOPICS, shortcutOf, topicOf, type CommandDef, type CommandGroup } from "./language/commands.ts";
import { MONO, tokenColor } from "./tokens.tsx";

/**
 * The console's reference, in the help overlay beside the keys: every command, generated from the
 * catalogue the console itself reads — so it lists exactly what the console accepts, in the colour
 * each command's token wears. Part by part, and topic by topic within each, as the completion list
 * orders them: a setting's shortcuts under the command that names it, each with what it is short for.
 */

// English literals, for /localize.
const GROUPS: { group: CommandGroup; title: string; note?: string }[] = [
  { group: "role", title: "The period’s words", note: "take a word; alone they move the context" },
  { group: "noun", title: "On a noun" },
  { group: "verb", title: "On a verb" },
  { group: "adjective", title: "On an adjective" },
  { group: "period", title: "On a period" },
  { group: "workspace", title: "On the workspace" },
];

export function ConsoleHelp({ onCommand }: { onCommand?: (name: string) => void }) {
  const t = useUiString();
  const headingId = useId();
  const row = (c: CommandDef) => {
    const shortcut = shortcutOf(c);
    return (
      <Box
        key={c.name}
        {...(onCommand && {
          component: "button",
          type: "button",
          onClick: () => onCommand(c.name),
          // English literal, for /localize.
          title: `Show /${c.name} in the console`,
          "data-testid": `console-help-row-${c.name}`,
        })}
        sx={{
          display: "flex",
          alignItems: "baseline",
          gap: 1.5,
          py: 0.3,
          fontSize: "0.82rem",
          ...(onCommand && {
            width: "100%",
            px: 0.5,
            mx: -0.5,
            border: 0,
            borderRadius: 0.5,
            background: "none",
            font: "inherit",
            color: "inherit",
            textAlign: "left",
            cursor: "pointer",
            "&:hover, &:focus-visible": { bgcolor: "action.hover" },
          }),
        }}
      >
        <Box component="span" sx={{ fontFamily: MONO, fontWeight: 500, minWidth: "7ch", color: tokenColor(c.color) }}>
          /{c.name}
        </Box>
        <Box component="span" sx={{ flex: 1 }}>
          {c.descriptionKey ? t(c.descriptionKey) : c.description}
        </Box>
        {(shortcut || c.aliases.length > 0) && (
          <Box component="span" sx={{ fontFamily: MONO, fontSize: "0.72rem", color: "text.disabled" }}>
            {/* A shortcut says what it is short for: /past = /tense past. */}
            {shortcut ? `= ${shortcut}` : c.aliases.map((a) => `/${a}`).join(" ")}
          </Box>
        )}
      </Box>
    );
  };
  return (
    <Box component="section" aria-labelledby={headingId} sx={{ mt: 2 }}>
      {/* English literals, for /localize. */}
      <Typography id={headingId} variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        The phrase console
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", lineHeight: 1.6, mb: 2, maxWidth: 820 }}>
        A line is commands and their words. Each word of the period is written in its own bracket, with
        what describes it — <Box component="span" sx={{ fontFamily: MONO }}>/subj ( cat /adj brown /pl ) /verb ( eat /past )</Box>{" "}
        — and the console opens the bracket as the command is finished; inside one, the list offers only
        what fits there. Square brackets hold a noun phrase hanging off a noun,{" "}
        <Box component="span" sx={{ fontFamily: MONO }}>/poss [ child /adj old ]</Box>, braces a new
        period, <Box component="span" sx={{ fontFamily: MONO }}>/rel subj {"{ … }"}</Box>; any bracket key
        types the right one. Outside every bracket a command attaches to the box under the cursor, and{" "}
        <Box component="span" sx={{ fontFamily: MONO }}>#2.obj</Box> names a noun of another period.
        Settings set a value, so a line means the same whatever the period held. ⇥ completes, or moves
        to the next word; ⇧↵ breaks the line; ↑ brings back an earlier line; ⇥ on an empty line offers
        the pinned ones.
        Choose a command for its page, with an example.
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
            {TOPICS.filter((topic) => topic.part === group).map((topic, i, all) => {
              const commands = COMMANDS.filter((c) => topicOf(c) === topic);
              if (commands.length === 0) return null;
              return (
                <Box key={topic.id} data-testid={`console-help-topic-${topic.id}`} sx={{ mt: i > 0 ? 1 : 0.25 }}>
                  {/* A part of one topic needs no heading of its own. */}
                  {all.length > 1 && (
                    <Typography
                      sx={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "text.disabled",
                      }}
                    >
                      {topic.labelKey ? t(topic.labelKey) : topic.label}
                    </Typography>
                  )}
                  {commands.map((c) => row(c))}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
