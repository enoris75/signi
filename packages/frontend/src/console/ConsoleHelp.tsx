import { Box, Typography } from "@mui/material";
import { useId, useMemo } from "react";
import type { UiStringKey } from "@signi/shared";
import { useUiString } from "../i18n/useUiString.ts";
import { Keycap } from "../keyboard/Keycap.tsx";
import { COMMANDS, TOPICS, shortcutOf, topicOf, type CommandDef, type CommandGroup } from "./language/commands.ts";
import { exampleIn } from "./language/help.ts";
import { MONO, tokenColor } from "./tokens.tsx";
import { useVocabulary } from "./useVocabulary.ts";

/**
 * The console's reference, in the help overlay beside the keys: every command, generated from the
 * catalogue the console itself reads — so it lists exactly what the console accepts, in the colour
 * each command's token wears. Part by part, and topic by topic within each, as the completion list
 * orders them: a setting's shortcuts under the command that names it, each with what it is short for.
 */

/**
 * One statement of the console's help, and the syntax it is about after a colon — outside the phrase,
 * as the C14 rule puts a value (C22). The syntax is the console's own, the same in every language
 * (P02's decision 3), except that a whole line marked `example` writes its words in the interface
 * language, as a help page's example does (`exampleIn`): `/subj ( gatto )` beside Italian.
 */
interface HelpLine {
  key: UiStringKey;
  syntax?: string;
  example?: boolean;
}

// The part's paragraph, one statement to a line: what a bracket holds and who writes it, what the
// list inside one offers, the other two brackets, where a command outside every bracket goes, a
// reference to another period, and why a line means the same however often it is applied.
const PROSE: HelpLine[] = [
  { key: "help.console.bracket", syntax: "/subj ( cat /adj brown /pl ) /verb ( eat /past )", example: true },
  { key: "help.console.writesBrackets" },
  { key: "help.console.listShows" },
  { key: "help.console.nounPhrase", syntax: "/subj ( book /poss [ child /adj old ] )", example: true },
  { key: "help.console.newPeriod", syntax: "/rel subj { … }" },
  { key: "help.console.commandEdits", syntax: "/pl" },
  { key: "help.console.otherNoun", syntax: "#2.obj" },
  { key: "help.console.setsValue", syntax: "/past" },
  { key: "help.console.lineAgain" },
];

// The prompt's keys, drawn as the keyboard sheet draws a row: what the key does, then its cap. A row
// with a `whereKey` says where it works before a colon, as the sheet's panel rows do.
const PROMPT_KEYS: { keys: string; labelKey: UiStringKey; whereKey?: UiStringKey }[] = [
  { keys: "Tab", labelKey: "help.console.tab" },
  { keys: "Shift+Enter", labelKey: "help.console.addLine" },
  { keys: "ArrowUp", labelKey: "help.console.previousLine" },
  { keys: "Tab", labelKey: "help.console.showPinned", whereKey: "help.console.emptyLine" },
];

// Each part headed by what its commands act on, the bare noun, as the keyboard sheet heads its
// sections; the CSS uppercases it. `title` is the English, the fallback for `titleKey`. The role
// commands' note says what one does with a word, and what it does without one.
const GROUPS: { group: CommandGroup; title: string; titleKey?: UiStringKey; notes?: HelpLine[] }[] = [
  {
    group: "role",
    title: "The period's words",
    titleKey: "console.topic.words",
    notes: [
      { key: "help.console.typeWord", syntax: "/subj ( … )" },
      { key: "help.console.moveCursor", syntax: "/subj" },
    ],
  },
  { group: "noun", title: "Noun", titleKey: "category.noun" },
  { group: "verb", title: "Verb", titleKey: "slot.verb" },
  { group: "adjective", title: "Adjective", titleKey: "category.adjective" },
  { group: "period", title: "Period", titleKey: "period.name" },
  { group: "workspace", title: "Workspace", titleKey: "console.topic.workspace" },
];

export function ConsoleHelp({ onCommand }: { onCommand?: (name: string) => void }) {
  const t = useUiString();
  const headingId = useId();
  const vocab = useVocabulary();
  // The examples' words in the interface language, once per vocabulary; the English stands until the
  // words have loaded, as on a help page.
  const syntaxOf = useMemo(() => {
    const written = new Map<string, string>();
    for (const line of [...PROSE, ...GROUPS.flatMap((g) => g.notes ?? [])]) {
      if (line.syntax) written.set(line.syntax, line.example ? exampleIn(line.syntax, vocab) : line.syntax);
    }
    return (syntax: string) => written.get(syntax) ?? syntax;
  }, [vocab]);
  const line = ({ key, syntax }: HelpLine) => (
    <Box key={key} data-testid="console-help-line">
      {t(key)}
      {syntax && (
        <>
          {": "}
          <Box component="span" sx={{ fontFamily: MONO }}>
            {syntaxOf(syntax)}
          </Box>
        </>
      )}
    </Box>
  );
  const row = (c: CommandDef) => {
    const shortcut = shortcutOf(c);
    return (
      <Box
        key={c.name}
        {...(onCommand && {
          component: "button",
          type: "button",
          onClick: () => onCommand(c.name),
          // The command's name is a value, so it follows the phrase: "Show in the console: /rel".
          title: `${t("action.showInConsole")}: /${c.name}`,
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
      {/* The part sits under the overlay's help, so the console's name alone heads it. Under it, the
          console's language one statement to a line, the prompt's keys, and what a row is for. */}
      <Typography id={headingId} variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t("console.name")}
      </Typography>
      <Box
        data-testid="console-help-prose"
        sx={{ color: "text.secondary", fontSize: "0.85rem", lineHeight: 1.6, mb: 2, maxWidth: 820 }}
      >
        {PROSE.map(line)}
        <Box
          data-testid="console-help-keys"
          sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, columnGap: 4, my: 0.75 }}
        >
          {PROMPT_KEYS.map(({ keys, labelKey, whereKey }) => (
            <Box key={labelKey} sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
              <Box component="span" sx={{ flex: 1 }}>
                {whereKey ? `${t(whereKey)}: ${t(labelKey)}` : t(labelKey)}
              </Box>
              <Keycap spec={keys} />
            </Box>
          ))}
        </Box>
        {line({ key: "help.console.chooseCommand" })}
      </Box>
      <Box sx={{ columnCount: { xs: 1, md: 2, lg: 3 }, columnGap: 4, "& > *": { breakInside: "avoid" } }}>
        {GROUPS.map(({ group, title, titleKey, notes }) => (
          <Box key={group} sx={{ mb: 3 }} data-testid={`console-help-${group}`}>
            <Typography
              data-testid="console-help-part"
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "primary.main",
              }}
            >
              {titleKey ? t(titleKey) : title}
            </Typography>
            {notes && (
              <Box
                data-testid="console-help-note"
                sx={{ fontStyle: "italic", fontSize: "0.72rem", color: "text.secondary", mb: 0.5 }}
              >
                {notes.map(line)}
              </Box>
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
